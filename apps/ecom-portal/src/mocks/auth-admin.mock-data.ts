// Modified by Sekar Nagarajan (2026-08-27 12:52)
import type { SubCustomerAccount, UserProfile } from '@solverminds/auth';
import type { AdminLoginSuccessResponse } from '../features/auth/types/auth.types';

export const MOCK_MENU_CATEGORIES: Record<string, 'D' | 'P'> = {
  SCH: 'D',
  TRK: 'D',
  BKG: 'P',
  SI: 'P',
  BL: 'P',
  VGM: 'P',
  DO: 'P',
  CRO: 'P',
  ARN: 'P',
  STMT: 'P',
  CO2: 'P',
  PAY: 'P',
};

const ALL_CAPABILITIES = [
  'SCH', 'TRK', 'BKG', 'SI', 'BL', 'CRO', 'ARN', 'STMT', 'CO2', 'VGM', 'PAY', 'DO',
];

const ALL_MODULES = [
  'dashboard', 'schedules', 'tracking', 'rates', 'booking', 'si', 'vgm',
  'bl', 'do', 'arrival-notice', 'cro', 'payments', 'customer-stmt',
  'carbon', 'contact-us',
];

export const MOCK_CUSTOMER_LIST: SubCustomerAccount[] = [
  { custCode: 'CUST-001', compName: 'Apex Logistics Global' },
  { custCode: 'CUST-002', compName: 'Atlantic Freight LLC' },
  { custCode: 'CUST-003', compName: 'Pacific Maritime Corp' },
  { custCode: 'CUST-004', compName: 'Nordic Shipping AB' },
  { custCode: 'CUST-005', compName: 'Global Cargo Holdings' },
  { custCode: 'CUST-006', compName: 'Orient Express Freight' },
  { custCode: 'CUST-007', compName: 'Oceanic Trade Solutions' },
  { custCode: 'CUST-008', compName: 'Equator Shipping Co.' },
  { custCode: 'CUST-009', compName: 'Meridian Logistics Ltd' },
  { custCode: 'CUST-010', compName: 'Southern Cross Freight' },
  { custCode: 'CUST-011', compName: 'Trans-Pacific Lines' },
  { custCode: 'CUST-012', compName: 'Continental Forwarding' },
];

export const MOCK_SYSTEM_ADMIN: AdminLoginSuccessResponse = {
  token: 'mock-jwt-sysadmin-cpanel',
  user: {
    id: 'usr_sysadmin_01',
    name: 'System Administrator',
    email: 'sysadmin@solverminds.com',
    company: 'Apex Logistics Global',
    role: 'ADMIN',
    capabilities: ALL_CAPABILITIES,
    customerCode: 'CUST-001',
    tenantId: 'TENANT_01',
    loginType: 'V',
    adminUserType: 'A',
    allowedModules: ['admin'],
    menuCategories: MOCK_MENU_CATEGORIES,
    // Default customer scope after cpanel login
    activeSubCustomer: 'CUST-001',
    subCustomerAccounts: MOCK_CUSTOMER_LIST,
    vendorMenuList: [
      // Cpanel-only modules: Module Mapping, Email Config, Cutoff Module
      'specialprivi',
      'emailtemplate',
      'cutoffconfig',
    ],
  },
};

export const MOCK_VENDOR_ADMIN: AdminLoginSuccessResponse = {
  token: 'mock-jwt-vendor-eadmin',
  user: {
    id: 'usr_vendor_01',
    name: 'Agency Admin User',
    email: 'agency@vendor.com',
    company: 'Premier Shipping Agency',
    role: 'VENDOR',
    capabilities: ALL_CAPABILITIES,
    tenantId: 'TENANT_01',
    loginType: 'V',
    adminUserType: 'V',
    vendorId: 'VND-001',
    allowedModules: ALL_MODULES,
    menuCategories: MOCK_MENU_CATEGORIES,
    vendorMenuList: [
      'specialprivi', 'emailtemplate', 'fieldconfig',
    ],
  },
};

export const MOCK_IMPERSONATION_ADMIN: AdminLoginSuccessResponse = {
  token: 'mock-jwt-admin-impersonate',
  user: {
    id: 'usr_imp_admin_01',
    name: 'Support Administrator',
    email: 'support@solverminds.com',
    company: 'Solverminds Technologies',
    role: 'ADMIN',
    capabilities: ALL_CAPABILITIES,
    tenantId: 'TENANT_01',
    loginType: 'U',
    adminUserType: 'C',
    isImpersonating: true,
    allowedModules: ALL_MODULES,
    menuCategories: MOCK_MENU_CATEGORIES,
  },
  customerList: MOCK_CUSTOMER_LIST,
};

export function buildImpersonatedUser(custCode: string): UserProfile {
  const customer = MOCK_CUSTOMER_LIST.find((c) => c.custCode === custCode);
  return {
    id: 'usr_imp_admin_01',
    name: 'Support Administrator',
    email: 'support@solverminds.com',
    company: customer?.compName ?? 'Unknown Company',
    role: 'ADMIN',
    capabilities: ALL_CAPABILITIES,
    customerCode: custCode,
    tenantId: 'TENANT_01',
    loginType: 'U',
    adminUserType: 'C',
    isImpersonating: true,
    impersonatedCustomer: customer ?? { custCode, compName: 'Unknown' },
    activeSubCustomer: custCode,
    allowedModules: ALL_MODULES,
    menuCategories: MOCK_MENU_CATEGORIES,
  };
}

/** Token-to-user lookup for GET /api/auth/me rehydration */
export const MOCK_TOKEN_USER_MAP: Record<string, UserProfile> = {
  'mock-jwt-sysadmin-cpanel': MOCK_SYSTEM_ADMIN.user,
  'mock-jwt-vendor-eadmin': MOCK_VENDOR_ADMIN.user,
  'mock-jwt-admin-impersonate': MOCK_IMPERSONATION_ADMIN.user,
};

/** Called by landing.handlers.ts to register customer login tokens for rehydration */
export function registerMockToken(token: string, user: UserProfile): void {
  MOCK_TOKEN_USER_MAP[token] = user;
}
