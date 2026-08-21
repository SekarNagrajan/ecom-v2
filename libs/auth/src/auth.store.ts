// Modified by Antigravity (2026-08-21)
import { create } from 'zustand';

export interface SubCustomerAccount {
  custCode: string;
  compName: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  capabilities: string[]; // e.g. ['SCH', 'TRK', 'BKG', 'SI', 'BL', 'VGM', 'PAY']
  customerCode?: string; // Legacy SESSION_CUSTCODE / SESSION_USERCODE
  tenantId?: string; // Multi-tenant ID (e.g. TENANT_01)
  allowedModules?: string[]; // Dynamic module key permissions from legacy RegMenus / VENDOR_MAIN_MENU
  isSessionAdmin?: boolean; // Legacy sessionAdmin == "Y" / USER_ROLL_ADMIN == "Y"
  subCustomerAccounts?: SubCustomerAccount[]; // Legacy sessionAdmindetails list
  activeSubCustomer?: string; // Active customer code when switching
  allowedUserCount?: number; // Legacy getalloweduser() limit
  createdUserCount?: number;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  setActiveSubCustomer: (custCode: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Default to unauthenticated — public landing page renders first.
  isAuthenticated: false,
  token: null,
  user: null,
  login: (token, user) => {
    localStorage.setItem('ecom_auth_token', token);
    set({ isAuthenticated: true, token, user });
  },
  logout: () => {
    localStorage.removeItem('ecom_auth_token');
    set({ isAuthenticated: false, token: null, user: null });
  },
  setActiveSubCustomer: (custCode: string) => {
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            activeSubCustomer: custCode,
          }
        : null,
    }));
  },
}));
