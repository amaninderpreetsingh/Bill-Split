import { useState } from 'react';
import { analyzeBillImage, BillData } from '../services/gemini';
import { MOCK_BILL_DATA, MOCK_PEOPLE } from '../utils/constants';
import { Person } from '../types';
import { useToast } from './use-toast';

export function useReceiptAnalyzer(
  setBillData: (data: BillData | null) => void,
  setPeople: (people: Person[]) => void,
  currentBillData?: BillData | null
) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeReceipt = async (imageUri: string) => {
    if (!imageUri) return;

    setIsAnalyzing(true);
    try {
      const data = await analyzeBillImage(imageUri);

      // If there's existing bill data, append new items instead of replacing
      if (currentBillData) {
        const mergedData: BillData = {
          ...currentBillData,
          items: [...currentBillData.items, ...data.items],
          // Update subtotal by adding new items
          subtotal: currentBillData.subtotal + data.subtotal,
          // Keep existing tax and tip, or use new ones if current is 0
          tax: currentBillData.tax || data.tax,
          tip: currentBillData.tip || data.tip,
          // Update total
          total: currentBillData.subtotal + data.subtotal + (currentBillData.tax || data.tax) + (currentBillData.tip || data.tip),
          // Use existing restaurant name if available
          restaurantName: currentBillData.restaurantName || data.restaurantName,
        };
        setBillData(mergedData);
        toast({
          title: 'Success!',
          description: `Added ${data.items.length} new items to your bill.`,
        });
      } else {
        // No existing data, just set the new data
        setBillData(data);
        toast({
          title: 'Success!',
          description: `Extracted ${data.items.length} items from your receipt.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Could not analyze receipt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadMockData = () => {
    setBillData(MOCK_BILL_DATA);
    setPeople(MOCK_PEOPLE);
    toast({
      title: 'Mock data loaded',
      description: `Loaded ${MOCK_BILL_DATA.items.length} test items.`,
    });
  };

  return {
    isAnalyzing,
    analyzeReceipt,
    loadMockData,
  };
}
