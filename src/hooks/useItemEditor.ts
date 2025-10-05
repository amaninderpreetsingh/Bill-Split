import { useState } from 'react';
import { BillData } from '@/types';
import { useToast } from './use-toast';

export function useItemEditor(
  billData: BillData | null,
  setBillData: (data: BillData) => void,
  customTip: string,
  removeItemAssignments: (itemId: string) => void
) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState('');
  const [editingItemPrice, setEditingItemPrice] = useState('');
  const { toast } = useToast();

  const editItem = (itemId: string, itemName: string, itemPrice: number) => {
    setEditingItemId(itemId);
    setEditingItemName(itemName);
    setEditingItemPrice(itemPrice.toString());
  };

  const saveEdit = () => {
    if (!billData || !editingItemId) return;

    const price = parseFloat(editingItemPrice);
    if (isNaN(price) || price < 0) {
      toast({
        title: 'Invalid price',
        description: 'Please enter a valid price.',
        variant: 'destructive',
      });
      return;
    }

    if (!editingItemName.trim()) {
      toast({
        title: 'Invalid name',
        description: 'Item name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    const updatedItems = billData.items.map(item =>
      item.id === editingItemId
        ? { ...item, name: editingItemName.trim(), price }
        : item
    );

    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);

    setBillData({
      ...billData,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal + billData.tax + (parseFloat(customTip) || billData.tip),
    });

    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditingItemName('');
    setEditingItemPrice('');
  };

  const deleteItem = (itemId: string) => {
    if (!billData) return;

    const updatedItems = billData.items.filter(item => item.id !== itemId);
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);

    setBillData({
      ...billData,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal + billData.tax + (parseFloat(customTip) || billData.tip),
    });

    removeItemAssignments(itemId);

    toast({
      title: 'Item deleted',
      description: 'Item removed from the bill.',
    });
  };

  return {
    editingItemId,
    editingItemName,
    editingItemPrice,
    setEditingItemName,
    setEditingItemPrice,
    editItem,
    saveEdit,
    cancelEdit,
    deleteItem,
  };
}
