import type { FileValidationResult } from '../types';

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate file size
 */
export function validateFileSize(
  file: File,
  maxSize: number
): FileValidationResult {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${formatFileSize(maxSize)}`,
    };
  }

  return { valid: true };
}

/**
 * Validate file MIME type
 */
export function validateMimeType(
  file: File,
  allowedTypes: string[]
): FileValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported',
    };
  }

  return { valid: true };
}

/**
 * Validate file (size and optionally MIME type)
 */
export function validateFile(
  file: File,
  maxSize: number,
  allowedTypes?: string[]
): FileValidationResult {
  // Validate size
  const sizeValidation = validateFileSize(file, maxSize);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // Validate MIME type if provided
  if (allowedTypes && allowedTypes.length > 0) {
    const typeValidation = validateMimeType(file, allowedTypes);
    if (!typeValidation.valid) {
      return typeValidation;
    }
  }

  return { valid: true };
}
