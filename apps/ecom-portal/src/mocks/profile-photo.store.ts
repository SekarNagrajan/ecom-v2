/**
 * Session store for the demo profile photo (not a fixture table).
 * Persisted via user-persistence session sidecar as base64.
 */

export type ProfilePhotoSnapshot = {
  contentType: string;
  base64: string;
} | null;

let mockPhotoBytes: ArrayBuffer | null = null;
let mockPhotoContentType = 'image/jpeg';

function bytesToBase64(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = '';
  for (let i = 0; i < view.length; i += 1) binary += String.fromCharCode(view[i]!);
  return btoa(binary);
}

function base64ToBytes(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out.buffer;
}

export function getProfilePhotoBytes(): ArrayBuffer | null {
  return mockPhotoBytes;
}

export function getProfilePhotoContentType(): string {
  return mockPhotoContentType;
}

export function setProfilePhoto(bytes: ArrayBuffer, contentType: string) {
  mockPhotoBytes = bytes;
  mockPhotoContentType = contentType || 'image/jpeg';
}

export function clearProfilePhoto() {
  mockPhotoBytes = null;
  mockPhotoContentType = 'image/jpeg';
}

/** Snapshot for runtime overlay (null when no photo). */
export function getProfilePhoto(): ProfilePhotoSnapshot {
  if (!mockPhotoBytes) return null;
  return {
    contentType: mockPhotoContentType,
    base64: bytesToBase64(mockPhotoBytes),
  };
}

/** Replace from overlay / tests. */
export function replaceProfilePhoto(next: ProfilePhotoSnapshot | undefined) {
  if (next == null) {
    clearProfilePhoto();
    return;
  }
  setProfilePhoto(base64ToBytes(next.base64), next.contentType);
}

/** Clear on demo reset. */
export function resetProfilePhoto() {
  clearProfilePhoto();
}
