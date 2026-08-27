// Modified by Sekar Nagarajan (2026-08-27 11:25)
import { create } from 'zustand';

export interface SubCustomerAccount {
  custCode: string;
  compName: string;
}

/** Legacy SESSION_LOGIN_TYPE: U = customer, V = vendor/admin */
export type SessionLoginType = 'U' | 'V';

/** Legacy ecom_adminuser_details.usertype: A = System Admin, V = Vendor, C = Customer Impersonation */
export type AdminUserType = 'A' | 'V' | 'C';

/** React entry-point identifier sent with admin login requests */
export type LoginEntryType = 'cpanel' | 'eadmin' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
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
  menuCategories?: Record<string, 'D' | 'P'>;
}

interface AuthState {
  isAuthenticated: boolean;
  isRehydrating: boolean;
  token: string | null;
  user: UserProfile | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  setActiveSubCustomer: (custCode: string) => void;
  setImpersonatedCustomer: (customer: SubCustomerAccount) => void;
  clearImpersonation: () => void;
  setRehydrating: (value: boolean) => void;
}

const AUTH_TOKEN_KEY = 'ecom_auth_token';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isRehydrating: false,
  token: null,
  user: null,
  login: (token, user) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    set({ isAuthenticated: true, isRehydrating: false, token, user });
  },
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    set({ isAuthenticated: false, isRehydrating: false, token: null, user: null });
  },
  setActiveSubCustomer: (custCode: string) => {
    set((state) => ({
      user: state.user
        ? { ...state.user, activeSubCustomer: custCode }
        : null,
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
