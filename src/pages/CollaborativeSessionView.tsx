import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReceiptUploader } from '@/components/receipt/ReceiptUploader';
import { PeopleManager } from '@/components/people/PeopleManager';
import { BillItems } from '@/components/bill/BillItems';
import { BillSummary } from '@/components/bill/BillSummary';
import { SplitSummary } from '@/components/people/SplitSummary';
import { AssignmentModeToggle } from '@/components/bill/AssignmentModeToggle';
import { ShareButton } from '@/components/share/ShareButton';
import { ShareSessionModal } from '@/components/share/ShareSessionModal';
import { CollaborativeBadge } from '@/components/share/CollaborativeBadge';
import { useBillSplitter } from '@/hooks/useBillSplitter';
import { usePeopleManager } from '@/hooks/usePeopleManager';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useReceiptAnalyzer } from '@/hooks/useReceiptAnalyzer';
import { useItemEditor } from '@/hooks/useItemEditor';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCollaborativeSession } from '@/hooks/useCollaborativeSession';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Receipt, Upload, Edit, Loader2, AlertCircle } from 'lucide-react';
import { UI_TEXT } from '@/utils/uiConstants';
import { Person, BillData, ItemAssignment, AssignmentMode } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function CollaborativeSessionView() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [activeTab, setActiveTab] = useState('ai-scan');
  const [showShareModal, setShowShareModal] = useState(false);
  const isInitializing = useRef(true);

  // Collaborative session hook with real-time updates
  const { session, isLoading, error, updateSession, endSession } = useCollaborativeSession(sessionId || null);

  // Local state synced with collaborative session
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
  const editor = useItemEditor(billData, setBillData, customTip, bill.removeItemAssignments);

  // Sync local state with collaborative session
  useEffect(() => {
    isInitializing.current = true;
    if (session) {
      setBillData(session.billData || null);
      setItemAssignments(session.itemAssignments || {});
      setPeople(session.people || []);
      setCustomTip(session.customTip || '');
      setCustomTax(session.customTax || '');
      setAssignmentMode(session.assignmentMode || 'checkboxes');
      setSplitEvenly(session.splitEvenly || false);
      if (session.receiptImageUrl) {
        upload.setImagePreview(session.receiptImageUrl);
        upload.setSelectedFile(new File([], session.receiptFileName || 'receipt.jpg'));
      }
    }
    const timer = setTimeout(() => (isInitializing.current = false), 200);
    return () => clearTimeout(timer);
  }, [session]);

  // Debounced auto-save to Firestore
  useEffect(() => {
    if (isInitializing.current || !session) return;

    const timeoutId = setTimeout(() => {
      updateSession({
        billData,
        people,
        itemAssignments,
        customTip,
        customTax,
        assignmentMode,
        splitEvenly,
      });
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [billData, people, itemAssignments, customTip, customTax, assignmentMode, splitEvenly, session, updateSession]);

  const handleRemovePerson = (personId: string) => {
    peopleManager.removePerson(personId);
    bill.removePersonFromAssignments(personId);
  };

  const handleAnalyzeReceipt = async () => {
    if (!upload.imagePreview || !upload.selectedFile) {
      console.error("Cannot analyze: image preview or file is missing.");
      return;
    }

    const analyzedBillData = await analyzer.analyzeReceipt(upload.selectedFile, upload.imagePreview);

    // Upload receipt and update session
    // Note: We'll handle image upload separately in production
    if (analyzedBillData) {
      updateSession({
        billData: analyzedBillData,
        receiptImageUrl: upload.imagePreview,
        receiptFileName: upload.selectedFile.name,
      });
    }
  };

  const handleImageSelected = async (fileOrBase64: File | string) => {
    if (typeof fileOrBase64 === 'string') {
      upload.setImagePreview(fileOrBase64);
      const response = await fetch(fileOrBase64);
      const blob = await response.blob();
      const file = new File([blob], 'receipt.jpg', { type: blob.type });
      upload.setSelectedFile(file);
    } else {
      upload.handleFileSelect(fileOrBase64);
    }
  };

  const handleEndSession = async () => {
    await endSession();
    navigate('/');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md p-8 space-y-4 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Session Error</h2>
          <p className="text-muted-foreground">{error || 'Session not found'}</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  // Session ended
  if (session.status === 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md p-8 space-y-4 text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Session Ended</h2>
          <p className="text-muted-foreground">This collaborative session has ended.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Header with Collaborative Badge and Share Button */}
      <div className="mb-6 space-y-4">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            {UI_TEXT.HERO_TITLE}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {UI_TEXT.HERO_SUBTITLE}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <CollaborativeBadge memberCount={session.members.length} />
          <ShareButton onClick={() => setShowShareModal(true)} />
        </div>

        {/* Show real-time collaboration notice */}
        <Alert>
          <AlertDescription className="text-center">
            This is a collaborative session. Changes are synced in real-time with all participants.
          </AlertDescription>
        </Alert>
      </div>

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
            isUploading={false}
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
            onRemove={upload.handleRemoveImage}
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
                onNameChange={peopleManager.setNewPersonName}
                onVenmoIdChange={peopleManager.setNewPersonVenmoId}
                onUseNameAsVenmoIdChange={peopleManager.setUseNameAsVenmoId}
                onAdd={peopleManager.addPerson}
                onAddFromFriend={peopleManager.addFromFriend}
                onRemove={handleRemovePerson}
                onSaveAsFriend={peopleManager.savePersonAsFriend}
                setPeople={setPeople}
              />

              <Card className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">{UI_TEXT.BILL_ITEMS}</h3>
                  </div>

                  {people.length > 0 && !isMobile && (
                    <AssignmentModeToggle mode={assignmentMode} onModeChange={setAssignmentMode} />
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
          {/* Similar to AI scan tab but without receipt uploader */}
          <PeopleManager
            people={people}
            newPersonName={peopleManager.newPersonName}
            newPersonVenmoId={peopleManager.newPersonVenmoId}
            useNameAsVenmoId={peopleManager.useNameAsVenmoId}
            onNameChange={peopleManager.setNewPersonName}
            onVenmoIdChange={peopleManager.setNewPersonVenmoId}
            onUseNameAsVenmoIdChange={peopleManager.setUseNameAsVenmoId}
            onAdd={peopleManager.addPerson}
            onAddFromFriend={peopleManager.addFromFriend}
            onRemove={handleRemovePerson}
            onSaveAsFriend={peopleManager.savePersonAsFriend}
            setPeople={setPeople}
          />

          <Card className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">Bill Items</h3>
              </div>

              {people.length > 0 && !isMobile && (
                <AssignmentModeToggle mode={assignmentMode} onModeChange={setAssignmentMode} />
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
        </TabsContent>
      </Tabs>

      {/* Share Modal */}
      <ShareSessionModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        sessionId={session.id}
        shareCode={session.shareCode}
        onEndSession={handleEndSession}
      />
    </>
  );
}
