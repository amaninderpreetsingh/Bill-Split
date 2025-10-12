import { VALID_FILE_TYPES, MAX_FILE_SIZE } from './constants';

export interface ValidationError {
  title: string;
  description: string;
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
