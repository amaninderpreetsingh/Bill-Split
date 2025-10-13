import { VALID_FILE_TYPES, MAX_FILE_SIZE } from './constants';

export interface ValidationError {
  title: string;
  description: string;
}

/**
 * Validation result type for form inputs
 */
export interface ValidationResult {
  isValid: boolean;
  error?: ValidationError;
}

export function validateFile(file: File): ValidationError | null {
  if (!VALID_FILE_TYPES.includes(file.type)) {
    return {
      title: 'Invalid file type',
      description: 'Please upload a JPG, PNG, or HEIC image.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      title: 'File too large',
      description: 'Please upload an image smaller than 20MB.',
    };
  }

  return null;
}

/**
 * Validates item input (name and price)
 * @param name - Item name
 * @param price - Item price as string
 * @returns Validation result with error details if invalid
 */
export function validateItemInput(
  name: string,
  price: string
): ValidationResult {
  // Validate name
  if (!name.trim()) {
    return {
      isValid: false,
      error: {
        title: 'Invalid name',
        description: 'Item name cannot be empty.',
      },
    };
  }

  // Validate price
  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum < 0) {
    return {
      isValid: false,
      error: {
        title: 'Invalid price',
        description: 'Please enter a valid price.',
      },
    };
  }

  return { isValid: true };
}

/**
 * Validates friend/person input
 * @param name - Person's name
 * @returns Validation result with error details if invalid
 */
export function validatePersonInput(name: string): ValidationResult {
  if (!name.trim()) {
    return {
      isValid: false,
      error: {
        title: 'Name required',
        description: "Please enter a person's name.",
      },
    };
  }

  return { isValid: true };
}

/**
 * Parses a price string and returns a valid number
 * @param priceStr - Price as string
 * @returns Parsed price or 0 if invalid
 */
export function parsePrice(priceStr: string): number {
  const price = parseFloat(priceStr);
  return isNaN(price) || price < 0 ? 0 : price;
}

/**
 * Validates that a string is a valid number
 * @param value - String to validate
 * @returns True if valid number
 */
export function isValidNumber(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
}
