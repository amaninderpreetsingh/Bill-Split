import { useState } from 'react';
import { analyzeBillImage, BillData } from '@/services/gemini';
import { MOCK_BILL_DATA, MOCK_PEOPLE } from '@/utils/constants';
import { Person } from '@/types';
import { useToast } from './use-toast';
import { mergeBillData } from '@/utils/billCalculations';

/**
 * Hook for analyzing receipts using AI and loading mock data
 * @param setBillData - Function to update bill data
 * @param setPeople - Function to update people list
 * @param currentBillData - Current bill data (for merging)
 * @returns Receipt analyzer state and handlers
 */

export function useReceiptAnalyzer(
  setBillData: (data: BillData | null) => void,
  setPeople: (people: Person[]) => void,
  currentBillData?: BillData | null
) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeReceipt = async (imagePreview: string) => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    try {
      const data = await analyzeBillImage(imagePreview);

      // If there's existing bill data, merge with new data
      if (currentBillData) {
        const mergedData = mergeBillData(currentBillData, data);
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
