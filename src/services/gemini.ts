/**
 * @fileOverview Extracts bill details (line items with prices, tax, tip, total) from an image of a restaurant bill using Firebase Cloud Functions.
 *
 * This service now calls a secure Firebase Cloud Function that handles Gemini AI API calls server-side,
 * protecting the API key from client-side exposure.
 *
 * - analyzeBillImage - A function that handles the bill extraction process via Cloud Function
 * - BillItem - Individual line item with name and price
 * - BillData - The complete extracted bill data structure
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/config/firebase';

/**
 * Represents a single line item on the bill
 */
export interface BillItem {
  id: string;
  name: string;
  price: number;
}

/**
 * Complete bill data structure returned from extraction
 */
export interface BillData {
  items: BillItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

// Initialize Firebase Functions
const functions = getFunctions(app);

/**
 * Analyzes a restaurant bill image and extracts structured data
 *
 * This function calls a Firebase Cloud Function that securely handles the Gemini AI API call.
 * The API key is stored server-side and never exposed to clients.
 *
 * @param base64Image - A photo of a restaurant bill, as a data URI with MIME type and Base64 encoding
 * @returns Promise containing extracted bill data with line items, tax, tip, and total
 */
export async function analyzeBillImage(base64Image: string): Promise<BillData> {
  try {
    // Call the Cloud Function
    const analyzeBill = httpsCallable<{ base64Image: string }, BillData>(functions, 'analyzeBill');
    const result = await analyzeBill({ base64Image });

    return result.data;
  } catch (error) {
    console.error('Error analyzing bill:', error);

    // Handle Firebase Functions errors
    if (error && typeof error === 'object' && 'code' in error) {
      const functionsError = error as { code: string; message: string };

      if (functionsError.code === 'unauthenticated') {
        throw new Error('Please sign in to analyze receipts');
      }

      if (functionsError.code === 'invalid-argument') {
        throw new Error('Invalid image format. Please upload a valid receipt image');
      }

      throw new Error(`Failed to analyze receipt: ${functionsError.message}`);
    }

    if (error instanceof Error) {
      throw new Error(`Failed to analyze receipt: ${error.message}`);
    }

    throw new Error('Failed to analyze receipt. Please try again.');
  }
}
