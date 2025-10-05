import { useState, useMemo, useRef } from 'react';
import { BillData, ItemAssignment, AssignmentMode, PersonTotal, Person } from '@/types';
import { calculatePersonTotals, areAllItemsAssigned } from '@/utils/calculations';
import { useToast } from './use-toast';

export function useBillSplitter(people: Person[]) {
  const [billData, setBillData] = useState<BillData | null>(null);
  const [itemAssignments, setItemAssignments] = useState<ItemAssignment>({});
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>('checkboxes');
  const [customTip, setCustomTip] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const effectiveTip = useMemo(() => {
    const customTipValue = parseFloat(customTip);
    if (!isNaN(customTipValue) && customTipValue >= 0) {
      return customTipValue;
    }
    return billData?.tip || 0;
  }, [customTip, billData]);

  const allItemsAssigned = useMemo(() => {
    return areAllItemsAssigned(billData, itemAssignments);
  }, [billData, itemAssignments]);

  const personTotals = useMemo((): PersonTotal[] => {
    if (!allItemsAssigned) return [];
    return calculatePersonTotals(billData, people, itemAssignments, effectiveTip);
  }, [billData, people, itemAssignments, allItemsAssigned, effectiveTip]);

  const handleItemAssignment = (itemId: string, personId: string, checked: boolean) => {
    const currentAssignments = itemAssignments[itemId] || [];

    if (checked) {
      setItemAssignments({
        ...itemAssignments,
        [itemId]: [...currentAssignments, personId],
      });
    } else {
      setItemAssignments({
        ...itemAssignments,
        [itemId]: currentAssignments.filter(pid => pid !== personId),
      });
    }
  };

  const removePersonFromAssignments = (personId: string) => {
    const newAssignments = { ...itemAssignments };
    Object.keys(newAssignments).forEach(itemId => {
      newAssignments[itemId] = newAssignments[itemId].filter(pid => pid !== personId);
    });
    setItemAssignments(newAssignments);
  };

  const removeItemAssignments = (itemId: string) => {
    const newAssignments = { ...itemAssignments };
    delete newAssignments[itemId];
    setItemAssignments(newAssignments);
  };

  const reset = () => {
    setBillData(null);
    setItemAssignments({});
    setCustomTip('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: 'Reset complete',
      description: 'Starting fresh!',
    });
  };

  return {
    billData,
    setBillData,
    itemAssignments,
    assignmentMode,
    setAssignmentMode,
    customTip,
    setCustomTip,
    effectiveTip,
    allItemsAssigned,
    personTotals,
    handleItemAssignment,
    removePersonFromAssignments,
    removeItemAssignments,
    reset,
    fileInputRef,
  };
}
