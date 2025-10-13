/**
 * Firebase Cloud Functions for Bill Split
 *
 * Securely handles Gemini AI API calls server-side to protect API keys
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { defineSecret } from 'firebase-functions/params';

// Define secret for Gemini API key
const geminiApiKey = defineSecret('GEMINI_API_KEY');

/**
 * Represents a single line item on the bill
 */
interface BillItem {
  id?: string;
  name: string;
  price: number;
}

/**
 * Complete bill data structure returned from extraction
 */
interface BillData {
  items: BillItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

/**
 * Request data for analyzeBill function
 */
interface AnalyzeBillRequest {
  base64Image: string;
}

/**
 * Cloud Function: Analyze restaurant bill using Gemini AI
 *
 * This function receives a base64-encoded image of a receipt,
 * sends it to Google Gemini AI for analysis, and returns structured bill data.
 *
 * The Gemini API key is stored securely in Firebase secrets and never exposed to clients.
 */
export const analyzeBill = onCall<AnalyzeBillRequest>(
  { secrets: [geminiApiKey] },
  async (request) => {
    // Validate request
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { base64Image } = request.data;

    if (!base64Image || typeof base64Image !== 'string') {
      throw new HttpsError('invalid-argument', 'base64Image must be a non-empty string');
    }

    if (!base64Image.startsWith('data:image/')) {
      throw new HttpsError('invalid-argument', 'base64Image must be a data URI with image MIME type');
    }

    try {
      // Initialize Gemini AI with secret API key
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `You are an expert in extracting information from restaurant bills. Given an image of a bill, extract the line items (with individual prices), tax, and tip.

IMPORTANT RULES:
1. If an item has a quantity greater than 1 (e.g., "2 Burritos" or "Burrito x2"), create SEPARATE entries for each item.
   For example: "2 Burritos @ $10 each" should become two separate burrito entries with $10 each.
2. Extract individual item prices, not the total for multiple items.
3. If the receipt shows "2 Burritos $20", divide by quantity to get individual price ($10 each).
4. The line items should be a list of individual items with their names and prices.
5. Tax, tip, subtotal, and total should be numerical values.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "items": [
    {"name": "Item Name", "price": 10.99},
    {"name": "Item Name", "price": 10.99}
  ],
  "subtotal": 50.00,
  "tax": 4.50,
  "tip": 10.00,
  "total": 64.50
}

Make sure:
- Each item in a quantity appears as a separate entry in the items array
- Each item has both "name" (string) and "price" (number)
- All monetary values are positive numbers (not strings)
- The items array contains individual items with individual prices`;

      // Detect MIME type from base64 string
      const mimeMatch = base64Image.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64Data = base64Image.split(',')[1];

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      };

      // Call Gemini AI
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Clean up the response - remove markdown code blocks if present
      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/^```json\s*/g, '').replace(/^```\s*/g, '');
      cleanedText = cleanedText.replace(/```\s*$/g, '');
      cleanedText = cleanedText.trim();

      const billData: BillData = JSON.parse(cleanedText);

      // Add unique IDs to each item
      billData.items = billData.items.map((item, index) => ({
        ...item,
        id: `item-${index}-${Date.now()}`,
      }));

      // Validate the data structure
      if (!billData.items || !Array.isArray(billData.items)) {
        throw new Error('Invalid response: items array is missing');
      }

      if (billData.items.length === 0) {
        throw new Error('No items found on the receipt');
      }

      // Validate each item has required fields
      for (const item of billData.items) {
        if (!item.name || typeof item.price !== 'number') {
          throw new Error('Invalid item structure: missing name or price');
        }
      }

      if (
        typeof billData.subtotal !== 'number' ||
        typeof billData.tax !== 'number' ||
        typeof billData.tip !== 'number' ||
        typeof billData.total !== 'number'
      ) {
        throw new Error('Invalid response: missing required numeric fields');
      }

      return billData;
    } catch (error) {
      console.error('Error analyzing bill:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpsError('internal', `Failed to analyze receipt: ${errorMessage}`);
    }
  }
);
