import { useState, useEffect, useRef } from 'react';
import { HeroSection } from '@/components/layout/HeroSection';
import { ReceiptUploader } from '@/components/receipt/ReceiptUploader';
import { PeopleManager } from '@/components/people/PeopleManager';
import { BillItems } from '@/components/bill/BillItems';
import { BillSummary } from '@/components/bill/BillSummary';
import { SplitSummary } from '@/components/people/SplitSummary';
import { AssignmentModeToggle } from '@/components/bill/AssignmentModeToggle';
import { FeatureCards } from '@/components/shared/FeatureCards';
import { useBillSplitter } from '@/hooks/useBillSplitter';
import { usePeopleManager } from '@/hooks/usePeopleManager';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useReceiptAnalyzer } from '@/hooks/useReceiptAnalyzer';
import { useItemEditor } from '@/hooks/useItemEditor';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Receipt, Users, Upload, Edit, Loader2 } from 'lucide-react';
import { useBillSession } from '@/contexts/BillSessionContext';
import { UI_TEXT } from '@/utils/uiConstants';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { Person, BillData, ItemAssignment, AssignmentMode } from '@/types';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AIScanView() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('ai-scan');
  const isInitializing = useRef(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Centralized state management
  const {
    activeSession,
    isLoadingSessions,
    isUploading,
    saveSession,
    archiveAndStartNewSession,
    uploadReceiptImage,
    resumeSession,
  } = useBillSession();

  const [people, setPeople] = useState<Person[]>([]);
  const [billData, setBillData] = useState<BillData | null>(null);
  const [itemAssignments, setItemAssignments] = useState<ItemAssignment>({});
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>('checkboxes');
  const [customTip, setCustomTip] = useState<string>('');
  const [customTax, setCustomTax] = useState<string>('');
  const [splitEvenly, setSplitEvenly] = useState<boolean>(false);

  const peopleManager = usePeopleManager(people, setPeople);
  const bill = useBillSplitter({
    people,
    billData,
    setBillData,
    itemAssignments,
    setItemAssignments,
    assignmentMode,
    setAssignmentMode,
    customTip,
    setCustomTip,
    customTax,
    setCustomTax,
    splitEvenly,
    setSplitEvenly,
  });

  const upload = useFileUpload();
  const analyzer = useReceiptAnalyzer(setBillData, setPeople, billData);
  const editor = useItemEditor(
    billData,
    setBillData,
    customTip,
    bill.removeItemAssignments
  );

  // Load session data from Firebase into local state
  useEffect(() => {
    isInitializing.current = true;
    if (activeSession) {
      setBillData(activeSession.billData || null);
      setItemAssignments(activeSession.itemAssignments || {});
      setPeople(activeSession.people || []);
      setCustomTip(activeSession.customTip || '');
      setCustomTax(activeSession.customTax || '');
      setAssignmentMode(activeSession.assignmentMode || 'checkboxes');
      setSplitEvenly(activeSession.splitEvenly || false);
      if (activeSession.receiptImageUrl) {
        upload.setImagePreview(activeSession.receiptImageUrl);
        upload.setSelectedFile(new File([], activeSession.receiptFileName || 'receipt.jpg'));
      } else {
        upload.handleRemoveImage();
      }
    } else {
      // If no session, reset to initial state
      setBillData(null);
      setItemAssignments({});
      setPeople([]);
      setCustomTip('');
      setCustomTax('');
      setAssignmentMode('checkboxes');
      setSplitEvenly(false);
      upload.handleRemoveImage();
    }
    // Allow saves after a short delay to let state updates settle
    const timer = setTimeout(() => (isInitializing.current = false), 200);
    return () => clearTimeout(timer);
  }, [activeSession]);

  // Effect to handle resuming a session from navigation state
  useEffect(() => {
    const { resumeSessionId } = location.state || {};
    if (resumeSessionId) {
      resumeSession(resumeSessionId);
      // Clear location state to prevent re-triggering on refresh
      navigate('.', { replace: true, state: {} });
    }
  }, [location, resumeSession, navigate]);

  useSessionTimeout({
    onTimeout: () => {
      // Only archive if there is data to save
      if (billData || people.length > 0) {
        archiveAndStartNewSession();
      }
    },
    timeoutMinutes: 20,
  });

  // Save local state to Firebase session
  useEffect(() => {
    // Avoid saving during initial load or if there's no data to save
    if (isInitializing.current || isLoadingSessions || (!billData && people.length === 0)) {
      return;
    }

    const debouncedSave = setTimeout(() => {
      saveSession({
        billData,
        itemAssignments,
        people,
        customTip,
        customTax,
        assignmentMode,
        splitEvenly,
      });
    }, 1000); // Debounce to avoid rapid writes

    return () => clearTimeout(debouncedSave);
  }, [
    billData,
    itemAssignments,
    people,
    customTip,
    customTax,
    assignmentMode,
    splitEvenly,
    saveSession,
    isLoadingSessions,
  ]);

  const handleRemovePerson = (personId: string) => {
    peopleManager.removePerson(personId);
    bill.removePersonFromAssignments(personId);
  };

  const handleRemoveImage = () => {
    // Clear local UI state immediately
    upload.handleRemoveImage();
    // Persist the removal to Firebase
    saveSession({
      receiptImageUrl: null,
      receiptFileName: null,
    });
  };

  const handleStartOver = () => {
    archiveAndStartNewSession();
  };

  const handleAnalyzeReceipt = async () => {
    if (!upload.imagePreview || !upload.selectedFile) {
      // TODO: Add toast notification for user
      console.error("Cannot analyze: image preview or file is missing.");
      return;
    }

    // Kick off analysis and upload in parallel
    const analysisPromise = analyzer.analyzeReceipt(upload.imagePreview);
    const uploadPromise = uploadReceiptImage(upload.selectedFile);

    await Promise.all([analysisPromise, uploadPromise]);
  };

  const handleImageSelected = async (fileOrBase64: File | string) => {
    if (typeof fileOrBase64 === 'string') {
      // From mobile camera (base64 string)
      upload.setImagePreview(fileOrBase64);
      // Convert base64 to file for upload
      const response = await fetch(fileOrBase64);
      const blob = await response.blob();
      const file = new File([blob], 'receipt.jpg', { type: blob.type });
      upload.setSelectedFile(file);
    } else {
      // From web file input (File object)
      upload.handleFileSelect(fileOrBase64);
    }
  };

  if (isLoadingSessions) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <HeroSection
        hasBillData={!!billData}
        onLoadMock={analyzer.loadMockData}
        onStartOver={handleStartOver}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-scan" className="gap-2">
            <Upload className="w-4 h-4" />
            AI Scan
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <Edit className="w-4 h-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-scan" className="space-y-6">
          <ReceiptUploader
            selectedFile={upload.selectedFile}
            imagePreview={upload.imagePreview}
            isDragging={upload.isDragging}
            isUploading={isUploading}
            isAnalyzing={analyzer.isAnalyzing}
            isMobile={isMobile}
            onFileInput={(e) => e.target.files && handleImageSelected(e.target.files[0])}
            onDragOver={upload.handleDragOver}
            onDragLeave={upload.handleDragLeave}
            onDrop={(e) => {
              upload.handleDrop(e);
              const file = e.dataTransfer.files?.[0];
              if (file) handleImageSelected(file);
            }}
            onRemove={handleRemoveImage}
            onAnalyze={handleAnalyzeReceipt}
            onImageSelected={handleImageSelected}
            fileInputRef={upload.fileInputRef}
          />

          {billData && (
            <div className="space-y-6">
              <PeopleManager
                people={people}
                newPersonName={peopleManager.newPersonName}
                newPersonVenmoId={peopleManager.newPersonVenmoId}
                useNameAsVenmoId={peopleManager.useNameAsVenmoId}
                saveToFriendsList={peopleManager.saveToFriendsList}
                onNameChange={peopleManager.setNewPersonName}
                onVenmoIdChange={peopleManager.setNewPersonVenmoId}
                onUseNameAsVenmoIdChange={peopleManager.setUseNameAsVenmoId}
                onSaveToFriendsListChange={peopleManager.setSaveToFriendsList}
                onAdd={peopleManager.addPerson}
                onAddFromFriend={peopleManager.addFromFriend}
                onRemove={handleRemovePerson}
                setPeople={setPeople}
              />

              <Card className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">{UI_TEXT.BILL_ITEMS}</h3>
                  </div>

                  {people.length > 0 && !isMobile && (
                    <AssignmentModeToggle
                      mode={assignmentMode}
                      onModeChange={setAssignmentMode}
                    />
                  )}
                </div>

                <BillItems
                  billData={billData}
                  people={people}
                  itemAssignments={itemAssignments}
                  assignmentMode={assignmentMode}
                  editingItemId={editor.editingItemId}
                  editingItemName={editor.editingItemName}
                  editingItemPrice={editor.editingItemPrice}
                  onAssign={bill.handleItemAssignment}
                  onEdit={editor.editItem}
                  onSave={editor.saveEdit}
                  onCancel={editor.cancelEdit}
                  onDelete={editor.deleteItem}
                  setEditingName={editor.setEditingItemName}
                  setEditingPrice={editor.setEditingItemPrice}
                  isAdding={editor.isAdding}
                  newItemName={editor.newItemName}
                  newItemPrice={editor.newItemPrice}
                  setNewItemName={editor.setNewItemName}
                  setNewItemPrice={editor.setNewItemPrice}
                  onStartAdding={editor.startAdding}
                  onAddItem={editor.addItem}
                  onCancelAdding={editor.cancelAdding}
                  splitEvenly={splitEvenly}
                  onToggleSplitEvenly={bill.toggleSplitEvenly}
                />

                {people.length === 0 && !isMobile && billData && (
                  <p className="text-sm text-muted-foreground text-center py-4 mt-4">
                    {UI_TEXT.ADD_PEOPLE_TO_ASSIGN}
                  </p>
                )}

                <BillSummary
                  billData={billData}
                  customTip={customTip}
                  effectiveTip={bill.effectiveTip}
                  customTax={customTax}
                  effectiveTax={bill.effectiveTax}
                  onTipChange={setCustomTip}
                  onTaxChange={setCustomTax}
                />
              </Card>

              <SplitSummary
                personTotals={bill.personTotals}
                allItemsAssigned={bill.allItemsAssigned}
                people={people}
                billData={billData}
                itemAssignments={itemAssignments}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <div className="space-y-6">
            <PeopleManager
              people={people}
              newPersonName={peopleManager.newPersonName}
              newPersonVenmoId={peopleManager.newPersonVenmoId}
              useNameAsVenmoId={peopleManager.useNameAsVenmoId}
              saveToFriendsList={peopleManager.saveToFriendsList}
              onNameChange={peopleManager.setNewPersonName}
              onVenmoIdChange={peopleManager.setNewPersonVenmoId}
              onUseNameAsVenmoIdChange={peopleManager.setUseNameAsVenmoId}
              onSaveToFriendsListChange={peopleManager.setSaveToFriendsList}
              onAdd={peopleManager.addPerson}
              onAddFromFriend={peopleManager.addFromFriend}
              onRemove={handleRemovePerson}
              setPeople={setPeople}
            />

            <Card className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold">Bill Items</h3>
                </div>

                {people.length > 0 && !isMobile && (
                  <AssignmentModeToggle
                    mode={assignmentMode}
                    onModeChange={setAssignmentMode}
                  />
                )}
              </div>

              <BillItems
                billData={billData}
                people={people}
                itemAssignments={itemAssignments}
                assignmentMode={assignmentMode}
                editingItemId={editor.editingItemId}
                editingItemName={editor.editingItemName}
                editingItemPrice={editor.editingItemPrice}
                onAssign={bill.handleItemAssignment}
                onEdit={editor.editItem}
                onSave={editor.saveEdit}
                onCancel={editor.cancelEdit}
                onDelete={editor.deleteItem}
                setEditingName={editor.setEditingItemName}
                setEditingPrice={editor.setEditingItemPrice}
                isAdding={editor.isAdding}
                newItemName={editor.newItemName}
                newItemPrice={editor.newItemPrice}
                setNewItemName={editor.setNewItemName}
                setNewItemPrice={editor.setNewItemPrice}
                onStartAdding={editor.startAdding}
                onAddItem={editor.addItem}
                onCancelAdding={editor.cancelAdding}
                splitEvenly={splitEvenly}
                onToggleSplitEvenly={bill.toggleSplitEvenly}
              />

              {people.length === 0 && !isMobile && billData && (
                <p className="text-sm text-muted-foreground text-center py-4 mt-4">
                  Add people above to assign items
                </p>
              )}

              {billData && (
                <BillSummary
                  billData={billData}
                  customTip={customTip}
                  effectiveTip={bill.effectiveTip}
                  customTax={customTax}
                  effectiveTax={bill.effectiveTax}
                  onTipChange={setCustomTip}
                  onTaxChange={setCustomTax}
                />
              )}
            </Card>

            {billData && (
              <SplitSummary
                personTotals={bill.personTotals}
                allItemsAssigned={bill.allItemsAssigned}
                people={people}
                billData={billData}
                itemAssignments={itemAssignments}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {!billData && <FeatureCards />}
    </>
  );
}
