// Modified by Sekar Nagarajan (2026-09-16 11:10)
import type {
  GridProfile,
  ProfileRenameInput,
  ProfileSaveAsInput,
} from "@solverminds/shared-ui/data-view/list-view";
import { useCallback, useMemo, useState } from "react";

/** Built-in baseline chip — never persisted. */
export const SYSTEM_DEFAULT_PROFILE_ID = "__system_default_view__";

const SYSTEM_DEFAULT_PROFILE: GridProfile = {
  id: SYSTEM_DEFAULT_PROFILE_ID,
  name: "Default View",
  description: "Built-in baseline. No filters, sorting, or column tweaks applied.",
  isSystem: true,
  isDefault: true,
};

const STORAGE_PREFIX = "ecom.grid-profiles.";

export type LocalGridProfileCategory =
  | "booking"
  | "bill-of-lading"
  | "bl-mcn"
  | "shipping-instruction"
  | "delivery-order"
  | "arrival-notice"
  | "container-release-order"
  | "customer-statement"
  | "user-creation"
  | "admin-cutoff"
  | "vendor-approvals"
  | "payment-history"
  | "quotes"
  | "rates-list"
  | "rates-contract"
  | "rates-tariff"
  | "rates-surcharge"
  | "rates-rfq"
  | "schedules"
  | "tracking";

interface StoredProfilesPayload {
  profiles: GridProfile[];
  activeProfileId?: string;
}

function readStore(category: string): StoredProfilesPayload {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${category}`);
    if (!raw) return { profiles: [] };
    const parsed = JSON.parse(raw) as StoredProfilesPayload;
    return {
      profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
      activeProfileId: parsed.activeProfileId,
    };
  } catch {
    return { profiles: [] };
  }
}

function writeStore(category: string, payload: StoredProfilesPayload) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${category}`, JSON.stringify(payload));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function newId() {
  return `gp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Client-side saved grid views (localStorage). Spread `profileHandlers` into
 * DataView `listOptions` together with `showToolbar: { showTotalCount: false }`.
 */
export function useLocalGridProfiles(category: LocalGridProfileCategory) {
  const [store, setStore] = useState<StoredProfilesPayload>(() =>
    readStore(category),
  );

  const persist = useCallback(
    (next: StoredProfilesPayload) => {
      setStore(next);
      writeStore(category, next);
    },
    [category],
  );

  const profiles = useMemo(
    () => [SYSTEM_DEFAULT_PROFILE, ...store.profiles.filter((p) => !p.isSystem)],
    [store.profiles],
  );

  const activeProfileId =
    store.activeProfileId &&
    profiles.some((p) => p.id === store.activeProfileId)
      ? store.activeProfileId
      : SYSTEM_DEFAULT_PROFILE_ID;

  const onProfileSelect = useCallback(
    (id: string) => {
      persist({ ...store, activeProfileId: id });
    },
    [persist, store],
  );

  const onProfileSaveAs = useCallback(
    (input: ProfileSaveAsInput) => {
      const profile: GridProfile = {
        id: newId(),
        name: input.name.trim() || "Untitled",
        description: input.description,
        state: input.state,
        isDefault: false,
      };
      persist({
        profiles: [...store.profiles, profile],
        activeProfileId: profile.id,
      });
    },
    [persist, store.profiles],
  );

  const onProfileSave = useCallback(
    (profile: GridProfile) => {
      if (profile.id === SYSTEM_DEFAULT_PROFILE_ID || profile.isSystem) return;
      persist({
        ...store,
        profiles: store.profiles.map((p) =>
          p.id === profile.id
            ? { ...p, state: profile.state, name: profile.name, description: profile.description }
            : p,
        ),
      });
    },
    [persist, store],
  );

  const onProfileRename = useCallback(
    (input: ProfileRenameInput) => {
      if (input.id === SYSTEM_DEFAULT_PROFILE_ID) return;
      persist({
        ...store,
        profiles: store.profiles.map((p) =>
          p.id === input.id
            ? {
                ...p,
                name: input.name.trim() || p.name,
                description: input.description,
              }
            : p,
        ),
      });
    },
    [persist, store],
  );

  const onProfileSetDefault = useCallback(
    (id: string) => {
      persist({
        ...store,
        activeProfileId: id,
        profiles: store.profiles.map((p) => ({
          ...p,
          isDefault: p.id === id,
        })),
      });
    },
    [persist, store],
  );

  const onProfileDelete = useCallback(
    (id: string) => {
      if (id === SYSTEM_DEFAULT_PROFILE_ID) return;
      const nextProfiles = store.profiles.filter((p) => p.id !== id);
      persist({
        profiles: nextProfiles,
        activeProfileId:
          store.activeProfileId === id
            ? SYSTEM_DEFAULT_PROFILE_ID
            : store.activeProfileId,
      });
    },
    [persist, store],
  );

  const onProfileReset = useCallback(() => {
    persist({ ...store, activeProfileId: SYSTEM_DEFAULT_PROFILE_ID });
  }, [persist, store]);

  const profileHandlers = useMemo(
    () =>
      ({
        enableProfiles: true as const,
        isLoadingProfiles: false,
        profiles,
        activeProfileId,
        onProfileSelect,
        onProfileSave,
        onProfileSaveAs,
        onProfileRename,
        onProfileSetDefault,
        onProfileDelete,
        onProfileReset,
      }) satisfies {
        enableProfiles: true;
        isLoadingProfiles: boolean;
        profiles: GridProfile[];
        activeProfileId: string;
        onProfileSelect: (id: string) => void;
        onProfileSave: (profile: GridProfile) => void;
        onProfileSaveAs: (input: ProfileSaveAsInput) => void;
        onProfileRename: (input: ProfileRenameInput) => void;
        onProfileSetDefault: (id: string) => void;
        onProfileDelete: (id: string) => void;
        onProfileReset: () => void;
      },
    [
      profiles,
      activeProfileId,
      onProfileSelect,
      onProfileSave,
      onProfileSaveAs,
      onProfileRename,
      onProfileSetDefault,
      onProfileDelete,
      onProfileReset,
    ],
  );

  return { profileHandlers, profiles, activeProfileId };
}

/** Shared listOptions defaults for full-page E-com DataViews (CRM parity). */
export const ECOM_LIST_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export function ecomListPagination(pageSize = 20) {
  return {
    pagination: true as const,
    paginationPageSize: pageSize,
    pageSizeOptions: [...ECOM_LIST_PAGE_SIZE_OPTIONS],
    sideBar: false as const,
    defaultColDef: { filter: true },
  };
}
