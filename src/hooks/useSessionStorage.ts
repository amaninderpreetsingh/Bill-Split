import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to sync React state with sessionStorage
 * @param key - sessionStorage key
 * @param initialValue - default value if nothing in storage
 * @returns [storedValue, setValue] - same API as useState
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Get initial value from sessionStorage or use provided initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update sessionStorage whenever storedValue changes
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
      // If quota exceeded or other error, silently fail
      // State will still work in memory
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

/**
 * Utility function to clear all bill split related sessionStorage keys
 */
export function clearBillSplitSessionStorage() {
  const keys = [
    'billsplit_billData',
    'billsplit_itemAssignments',
    'billsplit_customTip',
    'billsplit_customTax',
    'billsplit_assignmentMode',
    'billsplit_splitEvenly',
    'billsplit_people',
  ];

  keys.forEach(key => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  });
}
