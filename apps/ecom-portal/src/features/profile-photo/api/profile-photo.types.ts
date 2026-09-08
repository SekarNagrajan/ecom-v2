// Created by Sekar Nagarajan (2026-09-08 15:20)

/**
 * Thrown when the current user has no profile photo yet. Callers treat this
 * as a normal empty state (show initials) rather than a network error.
 */
export class ProfilePhotoNotFoundError extends Error {
  constructor() {
    super("Profile photo not found");
    this.name = "ProfilePhotoNotFoundError";
  }
}

export type ProfilePhotoStatus = "loading" | "ready" | "empty" | "error";
