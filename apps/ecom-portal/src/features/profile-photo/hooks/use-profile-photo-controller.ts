// Created by Sekar Nagarajan (2026-09-08 15:20)
import { useAuthStore } from "@solverminds/auth";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import {
  deleteOwnPhoto,
  fetchOwnPhotoBlob,
  uploadOwnPhoto,
} from "../api/profile-photo.api";
import {
  ProfilePhotoNotFoundError,
  type ProfilePhotoStatus,
} from "../api/profile-photo.types";

/**
 * Loads the current user's photo once per session and exposes optimistic
 * upload/remove. Shared via ProfilePhotoProvider so header + Profile drawer
 * + modal stay in sync without duplicate fetches.
 */
export function useProfilePhotoController() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [status, setStatus] = useState<ProfilePhotoStatus>("loading");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const photoUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      if (photoUrlRef.current) {
        URL.revokeObjectURL(photoUrlRef.current);
        photoUrlRef.current = null;
      }
      setPhotoUrl(null);
      setStatus("empty");
      return;
    }

    setStatus("loading");

    fetchOwnPhotoBlob()
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        photoUrlRef.current = url;
        setPhotoUrl(url);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStatus(
          error instanceof ProfilePhotoNotFoundError ? "empty" : "error",
        );
      });

    return () => {
      cancelled = true;
      if (photoUrlRef.current) {
        URL.revokeObjectURL(photoUrlRef.current);
        photoUrlRef.current = null;
      }
    };
  }, [isAuthenticated]);

  const { mutateAsync: uploadPhotoMutateAsync, isPending: isUploading } =
    useMutation({
      mutationFn: uploadOwnPhoto,
    });
  const { mutateAsync: deletePhotoMutateAsync, isPending: isRemoving } =
    useMutation({
      mutationFn: deleteOwnPhoto,
    });

  const upload = async (blob: Blob) => {
    const previousUrl = photoUrlRef.current;
    const optimisticUrl = URL.createObjectURL(blob);
    photoUrlRef.current = optimisticUrl;
    setPhotoUrl(optimisticUrl);
    setStatus("ready");

    try {
      await uploadPhotoMutateAsync(blob);
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }
    } catch (error) {
      URL.revokeObjectURL(optimisticUrl);
      photoUrlRef.current = previousUrl;
      setPhotoUrl(previousUrl);
      setStatus(previousUrl ? "ready" : "empty");
      throw error;
    }
  };

  const remove = async () => {
    const previousUrl = photoUrlRef.current;
    photoUrlRef.current = null;
    setPhotoUrl(null);
    setStatus("empty");

    try {
      await deletePhotoMutateAsync();
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }
    } catch (error) {
      photoUrlRef.current = previousUrl;
      setPhotoUrl(previousUrl);
      setStatus(previousUrl ? "ready" : "empty");
      throw error;
    }
  };

  return {
    status,
    photoUrl,
    upload,
    remove,
    isUploading,
    isRemoving,
  } as const;
}
