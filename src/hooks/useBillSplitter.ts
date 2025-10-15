import { useMemo, useRef, useEffect } from 'react';
import { BillData, ItemAssignment, AssignmentMode, PersonTotal, Person } from '@/types';
import { calculatePersonTotals, areAllItemsAssigned } from '@/utils/calculations';
import { useToast } from './use-toast';

interface BillSplitterProps {
  people: Person[];
  billData: BillData | null;
  setBillData: (billData: BillData | null) => void;
  itemAssignments: ItemAssignment;
  setItemAssignments: (assignments: ItemAssignment) => void;
  assignmentMode: AssignmentMode;
  setAssignmentMode: (mode: AssignmentMode) => void;
  customTip: string;
  setCustomTip: (tip: string) => void;
  customTax: string;
  setCustomTax: (tax: string) => void;
  splitEvenly: boolean;
  setSplitEvenly: (split: boolean) => void;
}

export function useBillSplitter({
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
}: BillSplitterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const effectiveTip = useMemo(() => {
    const customTipValue = parseFloat(customTip);
    if (!isNaN(customTipValue) && customTipValue >= 0) {
      return customTipValue;
    }
    return billData?.tip || 0;
  }, [customTip, billData]);

  const effectiveTax = useMemo(() => {
    const customTaxValue = parseFloat(customTax);
    if (!isNaN(customTaxValue) && customTaxValue >= 0) {
      return customTaxValue;
    }
    return billData?.tax || 0;
  }, [customTax, billData]);

  const allItemsAssigned = useMemo(() => {
    return areAllItemsAssigned(billData, itemAssignments);
  }, [billData, itemAssignments]);

  const personTotals = useMemo((): PersonTotal[] => {
    if (!allItemsAssigned) return [];
    return calculatePersonTotals(billData, people, itemAssignments, effectiveTip, effectiveTax);
  }, [billData, people, itemAssignments, allItemsAssigned, effectiveTip, effectiveTax]);

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

  

  return {
    billData,
    setBillData,
    itemAssignments,
    assignmentMode,
    setAssignmentMode,
    customTip,
    setCustomTip,
    effectiveTip,
    customTax,
    setCustomTax,
    effectiveTax,
    allItemsAssigned,
    personTotals,
    handleItemAssignment,
    removePersonFromAssignments,
    removeItemAssignments,
    splitEvenly,
    toggleSplitEvenly,
    fileInputRef,
  };
}
