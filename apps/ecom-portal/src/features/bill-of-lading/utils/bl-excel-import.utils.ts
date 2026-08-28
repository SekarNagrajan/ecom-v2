// Created by Sekar Nagarajan (2026-08-28 11:15)

export interface ExcelFileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateExcelFile(
  file: File,
  allowedExtensions: string[],
  maxCount?: number,
  currentCount = 0,
): ExcelFileValidationResult {
  const fileName = file.name.toLowerCase();
  const hasAllowedExtension = allowedExtensions.some((ext) =>
    fileName.endsWith(ext.toLowerCase()),
  );

  if (!hasAllowedExtension) {
    return {
      valid: false,
      error: `File must be one of: ${allowedExtensions.join(", ")}`,
    };
  }

  if (maxCount !== undefined && currentCount >= maxCount) {
    return {
      valid: false,
      error: `Maximum ${maxCount} Excel file(s) allowed.`,
    };
  }

  return { valid: true };
}
