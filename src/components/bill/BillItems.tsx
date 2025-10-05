import { Receipt } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BillData, Person, ItemAssignment, AssignmentMode } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { BillItemCard } from './BillItemCard';
import { BillItemsTable } from './BillItemsTable';
import { BillSummary } from './BillSummary';
import { AssignmentModeToggle } from './AssignmentModeToggle';

interface Props {
  billData: BillData;
  people: Person[];
  itemAssignments: ItemAssignment;
  assignmentMode: AssignmentMode;
  customTip: string;
  effectiveTip: number;
  editingItemId: string | null;
  editingItemName: string;
  editingItemPrice: string;
  onAssignmentModeChange: (mode: AssignmentMode) => void;
  onTipChange: (tip: string) => void;
  onEdit: (itemId: string, name: string, price: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (itemId: string) => void;
  onAssign: (itemId: string, personId: string, checked: boolean) => void;
  setEditingName: (name: string) => void;
  setEditingPrice: (price: string) => void;
}

export function BillItems(props: Props) {
  const isMobile = useIsMobile();
  const { billData, people, assignmentMode, onAssignmentModeChange } = props;

  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Bill Items</h3>
        </div>
        {people.length > 0 && !isMobile && (
          <AssignmentModeToggle mode={assignmentMode} onChange={onAssignmentModeChange} />
        )}
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {billData.items.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No items found. Try analyzing another receipt or add items manually.
            </p>
          ) : (
            billData.items.map((item) => (
              <BillItemCard
                key={item.id}
                item={item}
                people={props.people}
                itemAssignments={props.itemAssignments}
                isEditing={props.editingItemId === item.id}
                editingName={props.editingItemName}
                editingPrice={props.editingItemPrice}
                onEdit={props.onEdit}
                onSave={props.onSave}
                onCancel={props.onCancel}
                onDelete={props.onDelete}
                onAssign={props.onAssign}
                setEditingName={props.setEditingName}
                setEditingPrice={props.setEditingPrice}
              />
            ))
          )}
        </div>
      ) : (
        <BillItemsTable {...props} />
      )}

      {people.length === 0 && !isMobile && (
        <p className="text-sm text-muted-foreground text-center py-4 mt-4">
          Add people above to assign items
        </p>
      )}

      <BillSummary
        billData={billData}
        customTip={props.customTip}
        effectiveTip={props.effectiveTip}
        onTipChange={props.onTipChange}
      />
    </Card>
  );
}
