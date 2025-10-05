import { Check, Pencil, Trash2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BillData, BillItem, Person, ItemAssignment } from '@/types';
import { ItemAssignmentBadges } from '../shared/ItemAssignmentBadges';

interface Props {
  billData: BillData | null;
  people: Person[];
  itemAssignments: ItemAssignment;
  editingItemId: string | null;
  editingName: string;
  editingPrice: string;
  onEdit: (itemId: string, name: string, price: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (itemId: string) => void;
  onAssign: (itemId: string, personId: string, checked: boolean) => void;
  setEditingName: (name: string) => void;
  setEditingPrice: (price: string) => void;
  isAdding: boolean;
  newItemName: string;
  newItemPrice: string;
  setNewItemName: (name: string) => void;
  setNewItemPrice: (price: string) => void;
  onStartAdding: () => void;
  onAddItem: () => void;
  onCancelAdding: () => void;
}

export function BillItemCard({
  billData,
  people,
  itemAssignments,
  editingItemId,
  editingName,
  editingPrice,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onAssign,
  setEditingName,
  setEditingPrice,
  isAdding,
  newItemName,
  newItemPrice,
  setNewItemName,
  setNewItemPrice,
  onStartAdding,
  onAddItem,
  onCancelAdding,
}: Props) {
  const items = billData?.items || [];

  return (
    <>
      {!isAdding && (
        <Button onClick={onStartAdding} className="w-full mb-3 gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      )}

      {isAdding && (
        <Card className="p-4 space-y-3 border-2 border-primary mb-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Item Name</label>
            <Input
              placeholder="Enter item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && newItemPrice && onAddItem()}
              className="text-base"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                placeholder="0.00"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && newItemName && onAddItem()}
                className="text-base text-right pl-8"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={onAddItem}>
              <Check className="w-4 h-4 mr-2" />
              Add Item
            </Button>
            <Button variant="outline" className="flex-1" onClick={onCancelAdding}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {items.length === 0 && !isAdding && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No items yet. Click "Add Item" to get started.
          </p>
        </Card>
      )}

      {items.map((item) => {
        const isEditing = editingItemId === item.id;
        const hasAssignments = (itemAssignments[item.id] || []).length > 0;

        return (
          <Card
            key={item.id}
      className={`p-4 space-y-3 border-2 transition-all duration-300 ${
        hasAssignments
          ? 'border-primary shadow-lg shadow-primary/20 bg-primary/5'
          : 'border-border'
      }`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Item Name</label>
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="text-base"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                value={editingPrice}
                onChange={(e) => setEditingPrice(e.target.value)}
                className="text-base text-right pl-8"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={onSave}>
              <Check className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold text-base">{item.name}</h4>
              <p className="text-xl font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(item.id, item.name, item.price)}
                className="h-9 w-9 p-0"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(item.id)}
                className="h-9 w-9 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {people.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Assign to:</label>
              <ItemAssignmentBadges
                item={item}
                people={people}
                itemAssignments={itemAssignments}
                onAssign={onAssign}
                showSplit={true}
              />
            </div>
          )}
          </>
        )}
      </Card>
        );
      })}
    </>
  );
}
