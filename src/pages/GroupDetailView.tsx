import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReceiptUploader } from '@/components/receipt/ReceiptUploader';
import { PeopleManager } from '@/components/people/PeopleManager';
import { BillItems } from '@/components/bill/BillItems';
import { BillSummary } from '@/components/bill/BillSummary';
import { SplitSummary } from '@/components/people/SplitSummary';
import { AssignmentModeToggle } from '@/components/bill/AssignmentModeToggle';
import { useBillSplitter } from '@/hooks/useBillSplitter';
import { usePeopleManager } from '@/hooks/usePeopleManager';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useReceiptAnalyzer } from '@/hooks/useReceiptAnalyzer';
import { useItemEditor } from '@/hooks/useItemEditor';
import { useIsMobile } from '@/hooks/use-mobile';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Group } from '@/types/group.types';
import { Receipt } from 'lucide-react';

export default function GroupDetailView() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ai-scan');

  const people = usePeopleManager();
  const bill = useBillSplitter(people.people);
  const upload = useFileUpload();
  const analyzer = useReceiptAnalyzer(bill.setBillData, people.setPeople, bill.billData);
  const editor = useItemEditor(
    bill.billData,
    bill.setBillData,
    bill.customTip,
    bill.removeItemAssignments
  );

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;

      try {
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          const data = groupDoc.data();
          setGroup({
            id: groupDoc.id,
            name: data.name,
            description: data.description,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            ownerId: data.ownerId,
            memberIds: data.memberIds || [],
          });
        }
      } catch (error) {
        console.error('Error fetching group:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  const handleRemovePerson = (personId: string) => {
    people.removePerson(personId);
    bill.removePersonFromAssignments(personId);
  };

  const handleStartOver = () => {
    bill.reset();
    if (activeTab === 'ai-scan') {
      upload.handleRemoveImage();
    }
  };

  const handleAnalyzeReceipt = async () => {
    if (!upload.imagePreview) return;
    await analyzer.analyzeReceipt(upload.imagePreview);
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading group...</div>;
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Group not found</p>
        <Button onClick={() => navigate('/groups')}>Back to Groups</Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4 gap-2"
          onClick={() => navigate('/groups')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Groups
        </Button>

        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            {group.name}
          </h2>
          {group.description && (
            <p className="text-lg text-muted-foreground">{group.description}</p>
          )}
        </div>
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
          {bill.billData && (
            <div className="flex justify-end">
              <button
                onClick={handleStartOver}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Start Over
              </button>
            </div>
          )}

          <ReceiptUploader
            selectedFile={upload.selectedFile}
            imagePreview={upload.imagePreview}
            isDragging={upload.isDragging}
            isAnalyzing={analyzer.isAnalyzing}
            onFileInput={upload.handleFileInput}
            onDragOver={upload.handleDragOver}
            onDragLeave={upload.handleDragLeave}
            onDrop={upload.handleDrop}
            onRemove={upload.handleRemoveImage}
            onAnalyze={handleAnalyzeReceipt}
            fileInputRef={upload.fileInputRef}
          />

          {bill.billData && (
            <div className="space-y-6">
              <PeopleManager
                people={people.people}
                newPersonName={people.newPersonName}
                newPersonVenmoId={people.newPersonVenmoId}
                useNameAsVenmoId={people.useNameAsVenmoId}
                saveToFriendsList={people.saveToFriendsList}
                onNameChange={people.setNewPersonName}
                onVenmoIdChange={people.setNewPersonVenmoId}
                onUseNameAsVenmoIdChange={people.setUseNameAsVenmoId}
                onSaveToFriendsListChange={people.setSaveToFriendsList}
                onAdd={people.addPerson}
                onAddFromFriend={people.addFromFriend}
                onRemove={handleRemovePerson}
          setPeople={people.setPeople}
              />

              <Card className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Bill Items</h3>
                  </div>

                  {people.people.length > 0 && !isMobile && (
                    <AssignmentModeToggle
                      mode={bill.assignmentMode}
                      onModeChange={bill.setAssignmentMode}
                    />
                  )}
                </div>

                <BillItems
                  billData={bill.billData}
                  people={people.people}
                  itemAssignments={bill.itemAssignments}
                  assignmentMode={bill.assignmentMode}
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
                  splitEvenly={bill.splitEvenly}
                  onToggleSplitEvenly={bill.toggleSplitEvenly}
                />

                {people.people.length === 0 && !isMobile && bill.billData && (
                  <p className="text-sm text-muted-foreground text-center py-4 mt-4">
                    Add people above to assign items
                  </p>
                )}

                <BillSummary
                  billData={bill.billData}
                  customTip={bill.customTip}
                  effectiveTip={bill.effectiveTip}
                  onTipChange={bill.setCustomTip}
                />
              </Card>

              <SplitSummary
                personTotals={bill.personTotals}
                allItemsAssigned={bill.allItemsAssigned}
                people={people.people}
                billData={bill.billData}
                itemAssignments={bill.itemAssignments}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          {bill.billData && (
            <div className="flex justify-end">
              <button
                onClick={handleStartOver}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Start Over
              </button>
            </div>
          )}

          <div className="space-y-6">
            <PeopleManager
              people={people.people}
              newPersonName={people.newPersonName}
              newPersonVenmoId={people.newPersonVenmoId}
              useNameAsVenmoId={people.useNameAsVenmoId}
              saveToFriendsList={people.saveToFriendsList}
              onNameChange={people.setNewPersonName}
              onVenmoIdChange={people.setNewPersonVenmoId}
              onUseNameAsVenmoIdChange={people.setUseNameAsVenmoId}
              onSaveToFriendsListChange={people.setSaveToFriendsList}
              onAdd={people.addPerson}
              onAddFromFriend={people.addFromFriend}
              onRemove={handleRemovePerson}
          setPeople={people.setPeople}
            />

            <Card className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold">Bill Items</h3>
                </div>

                {people.people.length > 0 && !isMobile && (
                  <AssignmentModeToggle
                    mode={bill.assignmentMode}
                    onModeChange={bill.setAssignmentMode}
                  />
                )}
              </div>

              <BillItems
                billData={bill.billData}
                people={people.people}
                itemAssignments={bill.itemAssignments}
                assignmentMode={bill.assignmentMode}
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
                splitEvenly={bill.splitEvenly}
                onToggleSplitEvenly={bill.toggleSplitEvenly}
              />

              {people.people.length === 0 && !isMobile && bill.billData && (
                <p className="text-sm text-muted-foreground text-center py-4 mt-4">
                  Add people above to assign items
                </p>
              )}

              {bill.billData && (
                <BillSummary
                  billData={bill.billData}
                  customTip={bill.customTip}
                  effectiveTip={bill.effectiveTip}
                  onTipChange={bill.setCustomTip}
                />
              )}
            </Card>

            {bill.billData && (
              <SplitSummary
                personTotals={bill.personTotals}
                allItemsAssigned={bill.allItemsAssigned}
                people={people.people}
                billData={bill.billData}
                itemAssignments={bill.itemAssignments}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
