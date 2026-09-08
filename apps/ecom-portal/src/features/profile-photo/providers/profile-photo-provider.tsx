// Created by Sekar Nagarajan (2026-09-08 15:20)
import { createContext, useContext, type ReactNode } from "react";

import { useProfilePhotoController } from "../hooks/use-profile-photo-controller";

type ProfilePhotoValue = ReturnType<typeof useProfilePhotoController>;

const ProfilePhotoContext = createContext<ProfilePhotoValue | null>(null);

interface ProfilePhotoProviderProps {
  children: ReactNode;
}

/**
 * Mounts a single controller instance for the authenticated session so the
 * header avatar, Profile drawer, and upload modal share one photo URL.
 */
export function ProfilePhotoProvider({ children }: ProfilePhotoProviderProps) {
  const controller = useProfilePhotoController();

  return (
    <ProfilePhotoContext.Provider value={controller}>
      {children}
    </ProfilePhotoContext.Provider>
  );
}

export function useProfilePhoto(): ProfilePhotoValue {
  const value = useContext(ProfilePhotoContext);

  if (!value) {
    throw new Error(
      "useProfilePhoto must be used inside <ProfilePhotoProvider>.",
    );
  }

  return value;
}
