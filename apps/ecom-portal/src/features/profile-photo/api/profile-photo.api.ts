// Created by Sekar Nagarajan (2026-09-08 15:20)
import { ProfilePhotoNotFoundError } from "./profile-photo.types";

const OWN_PHOTO_URL = "/api/v1/user/profile/photo";

/**
 * Fetch the current user's profile photo as a blob. Normalizes a 404 (no
 * photo uploaded yet) into `ProfilePhotoNotFoundError`.
 */
export async function fetchOwnPhotoBlob(): Promise<Blob> {
  const response = await fetch(OWN_PHOTO_URL);

  if (response.status === 404) {
    throw new ProfilePhotoNotFoundError();
  }

  if (!response.ok) {
    throw new Error("Failed to fetch profile photo");
  }

  return response.blob();
}

export async function uploadOwnPhoto(blob: Blob): Promise<void> {
  const formData = new FormData();
  formData.append("file", blob, "profile-photo.jpg");

  const response = await fetch(OWN_PHOTO_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload profile photo");
  }
}

export async function deleteOwnPhoto(): Promise<void> {
  const response = await fetch(OWN_PHOTO_URL, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to remove profile photo");
  }
}
