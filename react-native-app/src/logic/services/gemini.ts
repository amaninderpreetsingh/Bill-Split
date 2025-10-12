/**
 * @fileOverview Extracts bill details (line items with prices, tax, tip, total) from an image of a restaurant bill using Google Gemini API.
 *
 * - analyzeBillImage - A function that handles the bill extraction process.
 * - BillItem - Individual line item with name and price
 * - BillData - The complete extracted bill data structure
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as FileSystem from 'expo-file-system';

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

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);

/**
 * Analyzes a restaurant bill image and extracts structured data
 * @param imageInput - Either a base64 data URI or a native file URI (file://, content://)
 * @returns Promise containing extracted bill data with line items, tax, tip, and total
 */
export async function analyzeBillImage(imageInput: string): Promise<BillData> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

    // Handle both base64 data URIs and native file URIs
    let base64Data: string;
    let mimeType: string;

    if (imageInput.startsWith('data:')) {
      // It's a base64 data URI (web format)
      const mimeMatch = imageInput.match(/^data:([^;]+);base64,/);
      mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      base64Data = imageInput.split(",")[1];
    } else {
      // It's a native file URI (file://, content://, etc.)
      // Convert to base64 using expo-file-system
      base64Data = await FileSystem.readAsStringAsync(imageInput, {
        encoding: FileSystem.EncodingType.Base64,
      });
      mimeType = "image/jpeg"; // Default to JPEG for native images
    }

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Clean up the response - remove markdown code blocks if present
    let cleanedText = text.trim();

    // Remove markdown code blocks (both ```json and ```)
    cleanedText = cleanedText.replace(/^```json\s*/g, "").replace(/^```\s*/g, "");
    cleanedText = cleanedText.replace(/```\s*$/g, "");
    cleanedText = cleanedText.trim();

    const billData: BillData = JSON.parse(cleanedText);

    // Add unique IDs to each item
    billData.items = billData.items.map((item, index) => ({
      ...item,
      id: `item-${index}-${Date.now()}`,
    }));

    // Validate the data structure
    if (!billData.items || !Array.isArray(billData.items)) {
      throw new Error("Invalid response: items array is missing");
    }

    if (billData.items.length === 0) {
      throw new Error("No items found on the receipt");
    }

    // Validate each item has required fields
    for (const item of billData.items) {
      if (!item.name || typeof item.price !== "number") {
        throw new Error("Invalid item structure: missing name or price");
      }
    }

    if (
      typeof billData.subtotal !== "number" ||
      typeof billData.tax !== "number" ||
      typeof billData.tip !== "number" ||
      typeof billData.total !== "number"
    ) {
      throw new Error("Invalid response: missing required numeric fields");
    }

    return billData;
  } catch (error) {
    console.error("Error analyzing bill:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to analyze receipt: ${error.message}`);
    }
    throw new Error("Failed to analyze receipt. Please try again.");
  }
}
