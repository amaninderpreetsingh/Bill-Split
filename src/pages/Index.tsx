import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/layout/HeroSection';
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
import { Card } from '@/components/ui/card';
import { Receipt, Users } from 'lucide-react';

const Index = () => {
  const isMobile = useIsMobile();

  const people = usePeopleManager();
  const bill = useBillSplitter(people.people);
  const upload = useFileUpload();
  const analyzer = useReceiptAnalyzer(bill.setBillData, people.setPeople);
  const editor = useItemEditor(
    bill.billData,
    bill.setBillData,
    bill.customTip,
    bill.removeItemAssignments
  );

  const handleRemovePerson = (personId: string) => {
    people.removePerson(personId);
    bill.removePersonFromAssignments(personId);
  };

  const handleStartOver = () => {
    bill.reset();
    upload.handleRemoveImage();
  };

  const handleAnalyzeReceipt = async () => {
    if (!upload.imagePreview) return;
    await analyzer.analyzeReceipt(upload.imagePreview);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <HeroSection
            hasBillData={!!bill.billData}
            onLoadMock={analyzer.loadMockData}
            onStartOver={handleStartOver}
          />

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
            <div className="mt-12 space-y-6">
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
                />

                {people.people.length === 0 && !isMobile && (
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

          {!bill.billData && (
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="p-6 text-center space-y-3 hover:shadow-medium transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                  <Receipt className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold">AI-Powered</h4>
                <p className="text-sm text-muted-foreground">
                  Gemini AI extracts items, tax, and tip automatically
                </p>
              </Card>

              <Card className="p-6 text-center space-y-3 hover:shadow-medium transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <h4 className="font-semibold">Fair Splitting</h4>
                <p className="text-sm text-muted-foreground">
                  Assign items to people with proportional tax & tip
                </p>
              </Card>

              <Card className="p-6 text-center space-y-3 hover:shadow-medium transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary-glow/10 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-primary-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold">Instant Results</h4>
                <p className="text-sm text-muted-foreground">
                  See who owes what in seconds, no manual math needed
                </p>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
