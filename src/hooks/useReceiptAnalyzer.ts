import { useState } from 'react';
import { analyzeBillImage, BillData } from '@/services/gemini';
import { MOCK_BILL_DATA, MOCK_PEOPLE } from '@/utils/constants';
import { Person } from '@/types';
import { useToast } from './use-toast';
import { mergeBillData } from '@/utils/billCalculations';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getFileChecksum } from '@/utils/crypto';

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

  const analyzeReceipt = async (imageFile: File, imagePreview: string) => {
    if (!imageFile || !imagePreview) return;

    setIsAnalyzing(true);
    try {
      const checksum = await getFileChecksum(imageFile);
      const cacheRef = doc(db, 'receiptAnalysisCache', checksum);
      const cacheSnap = await getDoc(cacheRef);

      let data: BillData;

      if (cacheSnap.exists()) {
        data = cacheSnap.data() as BillData;
        toast({
          title: 'Used Cached Result',
          description: 'This receipt has been analyzed before.',
        });
      } else {
        data = await analyzeBillImage(imagePreview);
        await setDoc(cacheRef, data);
      }

      if (currentBillData) {
        const mergedData = mergeBillData(currentBillData, data);
        setBillData(mergedData);
        toast({
          title: 'Success!',
          description: `Added ${data.items.length} new items to your bill.`,
        });
      } else {
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

  const deleteAnalysisCache = async (file: File) => {
    if (!file) return;
    try {
      const checksum = await getFileChecksum(file);
      const cacheRef = doc(db, 'receiptAnalysisCache', checksum);
      await deleteDoc(cacheRef);
    } catch (error) {
      console.error('Error deleting analysis cache:', error);
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
    deleteAnalysisCache,
  };
}
