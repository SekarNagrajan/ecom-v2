import type { UploadAllowedType } from '../types';

const ALLOWED_TYPE_MIME_MAP: Record<
  Exclude<UploadAllowedType, 'any'>,
  readonly string[]
> = {
  image: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
  pdf: ['application/pdf'],
  document: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  spreadsheet: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  presentation: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  text: ['text/plain'],
  csv: ['text/csv'],
  json: ['application/json'],
  archive: [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
  ],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
};

interface ResolveAcceptedMimeTypesOptions {
  allowedTypes?: UploadAllowedType[];
  acceptedTypes?: string[];
}

/**
 * Resolves accepted MIME types with precedence:
 * 1) acceptedTypes (explicit MIME list) if provided
 * 2) allowedTypes presets
 * 3) undefined (no MIME restriction)
 */
export function resolveAcceptedMimeTypes({
  allowedTypes,
  acceptedTypes,
}: ResolveAcceptedMimeTypesOptions): string[] | undefined {
  if (acceptedTypes && acceptedTypes.length > 0) {
    return acceptedTypes;
  }

  if (!allowedTypes || allowedTypes.length === 0) {
    return undefined;
  }

  if (allowedTypes.includes('any')) {
    return undefined;
  }

  const resolved = new Set<string>();
  for (const allowedType of allowedTypes) {
    if (allowedType === 'any') continue;
    const mimeTypes = ALLOWED_TYPE_MIME_MAP[allowedType];
    if (!mimeTypes) continue;

    for (const mimeType of mimeTypes) {
      resolved.add(mimeType);
    }
  }

  return Array.from(resolved);
}

export const uploadTypePresets = Object.freeze(ALLOWED_TYPE_MIME_MAP);
