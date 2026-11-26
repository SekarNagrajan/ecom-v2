// Modified by Sekar Nagarajan (2026-11-26 22:15)
import { create } from "zustand";
import {
  clearStoredSessionActivity,
  clearStoredToken,
  resolveExpiryMs,
  setStoredToken,
} from "@solverminds/platform";

export interface SubCustomerAccount {
  custCode: string;
  compName: string;
}

/** Legacy SESSION_LOGIN_TYPE: U = customer, V = vendor/admin */
export type SessionLoginType = "U" | "V";

/** Legacy ecom_adminuser_details.usertype: A = System Admin, V = Vendor, C = Customer Impersonation */
export type AdminUserType = "A" | "V" | "C";

/** React entry-point identifier sent with admin login requests */
export type LoginEntryType = "cpanel" | "eadmin" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
  capabilities: string[];
  customerCode?: string;
  tenantId?: string;
  allowedModules?: string[];
  isSessionAdmin?: boolean;
  isTenantAdmin?: boolean;
  subCustomerAccounts?: SubCustomerAccount[];
  activeSubCustomer?: string;
  allowedUserCount?: number;
  createdUserCount?: number;
  loginType: SessionLoginType;
  adminUserType?: AdminUserType;
  isImpersonating?: boolean;
  impersonatedCustomer?: SubCustomerAccount;
  vendorId?: string;
  vendorMenuList?: string[];
  menuCategories?: Record<string, "D" | "P">;
}

/** Server-provided session timing returned by login/refresh. All optional until the backend ships it. */
export interface SessionMeta {
  /** Access-token expiry (ISO string or epoch ms). Falls back to the JWT `exp` claim. */
  expiresAt?: string | number | null;
  /** Absolute session cap (ISO string or epoch ms). */
  sessionExpiresAt?: string | number | null;
}

export type LogoutReason = "manual" | "session-expired" | "idle" | "other-tab";

interface AuthState {
  isAuthenticated: boolean;
  isRehydrating: boolean;
  token: string | null;
  /** Access-token expiry, epoch ms; null when unknown (opaque token, no server value). */
  expiresAt: number | null;
  /** Absolute session end, epoch ms; null when unknown. */
  sessionExpiresAt: number | null;
  /** Why the last logout happened; consumed by the login screen / session manager. */
  lastLogoutReason: LogoutReason | null;
  user: UserProfile | null;
  login: (token: string, user: UserProfile, meta?: SessionMeta) => void;
  /** Swap in a refreshed access token without touching the user profile. */
  setToken: (token: string, expiresAt?: string | number | null) => void;
  logout: (reason?: LogoutReason) => void;
  setActiveSubCustomer: (custCode: string) => void;
  setImpersonatedCustomer: (customer: SubCustomerAccount) => void;
  clearImpersonation: () => void;
  setRehydrating: (value: boolean) => void;
}

const toMs = (value?: string | number | null): number | null => {
  if (value == null) return null;
  const ms = typeof value === "number" ? value : Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isRehydrating: false,
  token: null,
  expiresAt: null,
  sessionExpiresAt: null,
  lastLogoutReason: null,
  user: null,
  login: (token, user, meta) => {
    setStoredToken(token);
    set((state) => {
      // Re-login with the same token and no metadata (impersonation swap) keeps the known expiry.
      const keepTiming = !meta && state.token === token;
      return {
        isAuthenticated: true,
        isRehydrating: false,
        token,
        expiresAt: keepTiming ? state.expiresAt : resolveExpiryMs(token, meta?.expiresAt),
        sessionExpiresAt: keepTiming ? state.sessionExpiresAt : toMs(meta?.sessionExpiresAt),
        lastLogoutReason: null,
        user,
      };
    });
  },
  setToken: (token, expiresAt) => {
    setStoredToken(token);
    set({ token, expiresAt: resolveExpiryMs(token, expiresAt) });
  },
  logout: (reason = "manual") => {
    clearStoredToken();
    clearStoredSessionActivity();
    set({
      isAuthenticated: false,
      isRehydrating: false,
      token: null,
      expiresAt: null,
      sessionExpiresAt: null,
      lastLogoutReason: reason,
      user: null,
    });
  },
  setActiveSubCustomer: (custCode: string) => {
    set((state) => ({
      user: state.user ? { ...state.user, activeSubCustomer: custCode } : null,
    }));
  },
  setImpersonatedCustomer: (customer: SubCustomerAccount) => {
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            isImpersonating: true,
            impersonatedCustomer: customer,
            activeSubCustomer: customer.custCode,
          }
        : null,
    }));
  },
  clearImpersonation: () => {
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            isImpersonating: false,
            impersonatedCustomer: undefined,
            activeSubCustomer: undefined,
          }
        : null,
    }));
  },
  setRehydrating: (value: boolean) => {
    set({ isRehydrating: value });
  },
}));
