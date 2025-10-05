import { Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BillData, Person, ItemAssignment, AssignmentMode } from '@/types';
import { ItemAssignmentBadges } from '../shared/ItemAssignmentBadges';
import { ItemAssignmentDropdown } from '../shared/ItemAssignmentDropdown';

interface Props {
  billData: BillData | null;
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
  isAdding: boolean;
  newItemName: string;
  newItemPrice: string;
  setNewItemName: (name: string) => void;
  setNewItemPrice: (price: string) => void;
  onStartAdding: () => void;
  onAddItem: () => void;
  onCancelAdding: () => void;
}

export function BillItemsTable({
  billData,
  people,
  itemAssignments,
  assignmentMode,
  editingItemId,
  editingItemName,
  editingItemPrice,
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
        <div className="mb-4">
          <Button onClick={onStartAdding} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      )}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Item</TableHead>
              <TableHead className="text-right min-w-[80px]">Price</TableHead>
              {people.length > 0 && <TableHead className="min-w-[200px]">Assigned To</TableHead>}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAdding && (
              <TableRow className="bg-primary/5">
                <TableCell>
                  <Input
                    placeholder="Enter item name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onAddItem()}
                    className="h-8"
                    autoFocus
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="relative ml-auto w-24">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && onAddItem()}
                      className="h-8 text-right pl-5"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </TableCell>
                {people.length > 0 && <TableCell></TableCell>}
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onAddItem}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={onCancelAdding}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {items.length === 0 && !isAdding ? (
              <TableRow>
                <TableCell colSpan={people.length > 0 ? 4 : 3} className="text-center py-8 text-muted-foreground">
                  No items yet. Click "Add Item" to get started.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
              const hasAssignments = (itemAssignments[item.id] || []).length > 0;
              return (
                <TableRow
                  key={item.id}
                  className={`transition-all duration-300 ${
                    hasAssignments
                      ? 'border-l-4 !border-l-primary bg-primary/5'
                      : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <TableCell className="font-medium">
                    {editingItemId === item.id ? (
                      <Input
                        value={editingItemName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      item.name
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingItemId === item.id ? (
                      <div className="relative ml-auto w-24">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          value={editingItemPrice}
                          onChange={(e) => setEditingPrice(e.target.value)}
                          className="h-8 text-right pl-5"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    ) : (
                      `$${item.price.toFixed(2)}`
                    )}
                  </TableCell>
                  {people.length > 0 && (
                    <TableCell>
                      {assignmentMode === 'checkboxes' ? (
                        <ItemAssignmentBadges
                          item={item}
                          people={people}
                          itemAssignments={itemAssignments}
                          onAssign={onAssign}
                          showSplit={true}
                        />
                      ) : (
                        <ItemAssignmentDropdown
                          item={item}
                          people={people}
                          itemAssignments={itemAssignments}
                          onAssign={onAssign}
                          showSplit={true}
                        />
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    {editingItemId === item.id ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={onSave}>
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={onCancel}>
                          <X className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => onEdit(item.id, item.name, item.price)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDelete(item.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
    </>
  );
}
