import { BillData, Person, ItemAssignment, AssignmentMode } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { BillItemCard } from './BillItemCard';
import { BillItemsTable } from './BillItemsTable';

interface Props {
  billData: BillData;
  people: Person[];
  itemAssignments: ItemAssignment;
  assignmentMode: AssignmentMode;
  editingItemId: string | null;
  editingItemName: string;
  editingItemPrice: string;
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

  if (isMobile) {
    return (
      <div className="space-y-3">
        {props.billData.items.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No items found. Try analyzing another receipt or add items manually.
          </p>
        ) : (
          props.billData.items.map((item) => (
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
    );
  }

  return <BillItemsTable {...props} />;
}
