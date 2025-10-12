import { useState, useMemo, useEffect } from 'react';
import { BillData } from '../types/bill.types';
import { ItemAssignment, AssignmentMode, PersonTotal } from '../types/assignment.types';
import { Person } from '../types/person.types';
import { calculatePersonTotals, areAllItemsAssigned } from '../utils/calculations';
import { useToast } from './use-toast';

export function useBillSplitter(people: Person[]) {
  const [billData, setBillData] = useState<BillData | null>(null);
  const [itemAssignments, setItemAssignments] = useState<ItemAssignment>({});
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>('checkboxes');
  const [customTip, setCustomTip] = useState('');
  const [splitEvenly, setSplitEvenly] = useState(false);
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

  const assignEveryoneToAllItems = () => {
    if (!billData || people.length === 0) return;

    const newAssignments: ItemAssignment = {};
    billData.items.forEach(item => {
      newAssignments[item.id] = people.map(person => person.id);
    });
    setItemAssignments(newAssignments);
  };

  const toggleSplitEvenly = () => {
    const newSplitEvenly = !splitEvenly;
    setSplitEvenly(newSplitEvenly);

    if (newSplitEvenly) {
      assignEveryoneToAllItems();
      toast({
        title: 'Split evenly enabled',
        description: 'All items will be split equally among all people.',
      });
    } else {
      toast({
        title: 'Split evenly disabled',
        description: 'You can now manually assign items to people.',
      });
    }
  };

  // When split evenly is enabled, automatically assign new items or people
  useEffect(() => {
    if (splitEvenly && billData && people.length > 0) {
      assignEveryoneToAllItems();
    }
  }, [splitEvenly, billData?.items.length, people.length]);

  const reset = () => {
    setBillData(null);
    setItemAssignments({});
    setCustomTip('');
    setSplitEvenly(false);
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
    splitEvenly,
    toggleSplitEvenly,
    reset,
  };
}
