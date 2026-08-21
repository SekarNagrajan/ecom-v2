function toAcceptTokens(accept?: string) {
  return (accept ?? '')
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

function matchesAcceptToken(file: File, token: string) {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  if (token.startsWith('.')) {
    return fileName.endsWith(token);
  }

  if (token.endsWith('/*')) {
    const mimePrefix = token.slice(0, -1);
    return mimeType.startsWith(mimePrefix);
  }

  return mimeType === token;
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) {
    return '0 Bytes';
  }

  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** unitIndex;
  const formattedValue =
    unitIndex === 0 ? String(Math.round(value)) : value.toFixed(1);

  return `${formattedValue} ${units[unitIndex]}`;
}

export function validateFileAgainstConstraints(
  file: File,
  options: {
    accept?: string;
    maxSizeBytes?: number;
  }
) {
  if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
    return `File size must be ${formatFileSize(
      options.maxSizeBytes
    )} or smaller.`;
  }

  const acceptedTokens = toAcceptTokens(options.accept);
  if (
    acceptedTokens.length > 0 &&
    !acceptedTokens.some((token) => matchesAcceptToken(file, token))
  ) {
    return `Please upload image of type ${acceptedTokens.join(', ')} only.`;
  }

  return null;
}
