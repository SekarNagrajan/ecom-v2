// Modified by Antigravity (2026-08-21)
import { http, HttpResponse } from 'msw';
import { PRECONFIGURED_TENANTS } from '@solverminds/auth';
import type { EquipmentType, PortOption, TabConfig } from '../features/landing/types/landing.types';
import type { LoginSuccessResponse } from '../features/auth/types/auth.types';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_PORTS: PortOption[] = [
  { portCode: 'SGSIN', portName: 'Singapore', label: 'SGSIN - Singapore' },
  { portCode: 'CNSHA', portName: 'Shanghai', label: 'CNSHA - Shanghai' },
  { portCode: 'USNYC', portName: 'New York', label: 'USNYC - New York' },
  { portCode: 'GBFXT', portName: 'Felixstowe', label: 'GBFXT - Felixstowe' },
  { portCode: 'AEDXB', portName: 'Dubai (Jebel Ali)', label: 'AEDXB - Dubai (Jebel Ali)' },
  { portCode: 'DEHAM', portName: 'Hamburg', label: 'DEHAM - Hamburg' },
  { portCode: 'NLRTM', portName: 'Rotterdam', label: 'NLRTM - Rotterdam' },
  { portCode: 'INMAA', portName: 'Chennai', label: 'INMAA - Chennai' },
  { portCode: 'INMUN', portName: 'Mumbai (JNPT)', label: 'INMUN - Mumbai (JNPT)' },
  { portCode: 'INPAV', portName: 'Pipavav', label: 'INPAV - Pipavav' },
  { portCode: 'HKHKG', portName: 'Hong Kong', label: 'HKHKG - Hong Kong' },
  { portCode: 'JPYOK', portName: 'Yokohama', label: 'JPYOK - Yokohama' },
];

const MOCK_EQUIPMENT_TYPES: EquipmentType[] = [
  { code: '20GP', name: "20' General Purpose" },
  { code: '40GP', name: "40' General Purpose" },
  { code: '40HC', name: "40' High Cube" },
  { code: '20RF', name: "20' Reefer" },
  { code: '40RF', name: "40' Reefer" },
  { code: '20OT', name: "20' Open Top" },
  { code: '40OT', name: "40' Open Top" },
];

const MOCK_TAB_CONFIG: TabConfig = {
  schedules: 'public',
  tracking: 'public',
  rates: 'public',
};

const MOCK_TENANT_USERS: Record<string, LoginSuccessResponse> = {
  TENANT_01: {
    token: 'mock-jwt-tenant-01',
    user: {
      id: 'usr_t1',
      name: 'John Shipper (SVM)',
      email: 'john.shipper@svmshipping.com',
      company: PRECONFIGURED_TENANTS.TENANT_01.name,
      role: 'CUSTOMER',
      capabilities: ['SCH', 'TRK', 'BKG', 'SI', 'BL', 'VGM', 'PAY'],
      customerCode: PRECONFIGURED_TENANTS.TENANT_01.customerCode,
      tenantId: 'TENANT_01',
      allowedModules: PRECONFIGURED_TENANTS.TENANT_01.features.allowedModules,
    },
  },
  TENANT_02: {
    token: 'mock-jwt-tenant-02',
    user: {
      id: 'usr_t2',
      name: 'Pacific Freight Admin',
      email: 'logistics@pacificline.com',
      company: PRECONFIGURED_TENANTS.TENANT_02.name,
      role: 'CUSTOMER',
      capabilities: ['SCH', 'TRK', 'BKG', 'SI', 'BL', 'VGM', 'PAY'],
      customerCode: PRECONFIGURED_TENANTS.TENANT_02.customerCode,
      tenantId: 'TENANT_02',
      allowedModules: PRECONFIGURED_TENANTS.TENANT_02.features.allowedModules,
    },
  },
  TENANT_03: {
    token: 'mock-jwt-tenant-03',
    user: {
      id: 'usr_t3',
      name: 'Global Cargo User',
      email: 'ops@globalcargo.com',
      company: PRECONFIGURED_TENANTS.TENANT_03.name,
      role: 'CUSTOMER',
      capabilities: ['SCH', 'TRK', 'BKG', 'SI', 'BL', 'PAY'],
      customerCode: PRECONFIGURED_TENANTS.TENANT_03.customerCode,
      tenantId: 'TENANT_03',
      allowedModules: PRECONFIGURED_TENANTS.TENANT_03.features.allowedModules,
    },
  },
  TENANT_04: {
    token: 'mock-jwt-tenant-04',
    user: {
      id: 'usr_t4',
      name: 'Apex Container Manager',
      email: 'export@apexcontainer.com',
      company: PRECONFIGURED_TENANTS.TENANT_04.name,
      role: 'CUSTOMER',
      capabilities: ['SCH', 'TRK', 'BKG', 'BL', 'VGM'],
      customerCode: PRECONFIGURED_TENANTS.TENANT_04.customerCode,
      tenantId: 'TENANT_04',
      allowedModules: PRECONFIGURED_TENANTS.TENANT_04.features.allowedModules,
    },
  },
  TENANT_05: {
    token: 'mock-jwt-tenant-05',
    user: {
      id: 'usr_t5',
      name: 'Orient Trans Planner',
      email: 'shipping@orienttrans.com',
      company: PRECONFIGURED_TENANTS.TENANT_05.name,
      role: 'CUSTOMER',
      capabilities: ['SCH', 'TRK', 'BKG', 'SI', 'BL', 'VGM', 'PAY'],
      customerCode: PRECONFIGURED_TENANTS.TENANT_05.customerCode,
      tenantId: 'TENANT_05',
      allowedModules: PRECONFIGURED_TENANTS.TENANT_05.features.allowedModules,
    },
  },
  TENANT_06: {
    token: 'mock-jwt-tenant-06',
    user: {
      id: 'usr_t6',
      name: 'Nordic Seas Officer',
      email: 'support@nordicseas.com',
      company: PRECONFIGURED_TENANTS.TENANT_06.name,
      role: 'CUSTOMER',
      capabilities: ['SCH', 'TRK', 'BKG', 'SI', 'BL', 'VGM'],
      customerCode: PRECONFIGURED_TENANTS.TENANT_06.customerCode,
      tenantId: 'TENANT_06',
      allowedModules: PRECONFIGURED_TENANTS.TENANT_06.features.allowedModules,
    },
  },
  TENANT_07: {
    token: 'mock-jwt-tenant-07',
    user: {
      id: 'usr_t7',
      name: 'Atlantic Logistics Lead',
      email: 'trade@atlantichub.com',
      company: PRECONFIGURED_TENANTS.TENANT_07.name,
      role: 'CUSTOMER',
      capabilities: ['SCH', 'TRK', 'BKG', 'SI', 'BL', 'PAY'],
      customerCode: PRECONFIGURED_TENANTS.TENANT_07.customerCode,
      tenantId: 'TENANT_07',
      allowedModules: PRECONFIGURED_TENANTS.TENANT_07.features.allowedModules,
    },
  },
  TENANT_08: {
    token: 'mock-jwt-tenant-08',
    user: {
      id: 'usr_t8',
      name: 'Equator Freight Agent',
      email: 'booking@equatorfreight.com',
      company: PRECONFIGURED_TENANTS.TENANT_08.name,
      role: 'CUSTOMER',
      capabilities: ['SCH', 'TRK', 'BKG', 'SI', 'BL', 'VGM', 'PAY'],
      customerCode: PRECONFIGURED_TENANTS.TENANT_08.customerCode,
      tenantId: 'TENANT_08',
      allowedModules: PRECONFIGURED_TENANTS.TENANT_08.features.allowedModules,
    },
  },
  TENANT_09: {
    token: 'mock-jwt-tenant-09',
    user: {
      id: 'usr_t9',
      name: 'Oceanic Trade Coordinator',
      email: 'cargo@oceanictrade.com',
      company: PRECONFIGURED_TENANTS.TENANT_09.name,
      role: 'CUSTOMER',
      capabilities: ['SCH', 'TRK', 'BKG', 'SI', 'BL', 'VGM', 'PAY'],
      customerCode: PRECONFIGURED_TENANTS.TENANT_09.customerCode,
      tenantId: 'TENANT_09',
      allowedModules: PRECONFIGURED_TENANTS.TENANT_09.features.allowedModules,
    },
  },
  TENANT_10: {
    token: 'mock-jwt-tenant-10',
    user: {
      id: 'usr_t10',
      name: 'Solverminds Enterprise Client',
      email: 'ecom@solverminds.com',
      company: PRECONFIGURED_TENANTS.TENANT_10.name,
      role: 'CUSTOMER',
      capabilities: ['SCH', 'TRK', 'BKG', 'SI', 'BL', 'VGM', 'PAY'],
      customerCode: PRECONFIGURED_TENANTS.TENANT_10.customerCode,
      tenantId: 'TENANT_10',
      allowedModules: PRECONFIGURED_TENANTS.TENANT_10.features.allowedModules,
    },
  },
};

const MOCK_ADMIN_USER: LoginSuccessResponse = {
  token: 'mock-jwt-admin-67890',
  user: {
    id: 'usr_admin_01',
    name: 'System Admin',
    email: 'admin@solverminds.com',
    company: 'Solverminds Global Admin',
    role: 'ADMIN',
    capabilities: ['SCH', 'TRK', 'BKG', 'SI', 'BL', 'VGM', 'PAY'],
    customerCode: 'CUST001',
    tenantId: 'TENANT_01',
    allowedModules: ['dashboard', 'schedules', 'tracking', 'rates', 'booking', 'si', 'vgm', 'bl', 'do', 'arrival-notice', 'cro', 'payments', 'customer-stmt', 'carbon', 'contact-us'],
  },
};

const MOCK_SUPERUSER_USER: LoginSuccessResponse = {
  token: 'mock-jwt-superuser-99999',
  user: {
    id: 'usr_superuser_01',
    name: 'Master Customer Admin',
    email: 'superuser@apexlogistics.com',
    company: 'Apex Global Holding',
    role: 'CUSTOMER',
    capabilities: ['SCH', 'TRK', 'BKG', 'SI', 'BL', 'VGM', 'PAY'],
    customerCode: 'CUST-001',
    tenantId: 'TENANT_01',
    isSessionAdmin: true,
    subCustomerAccounts: [
      { custCode: 'CUST-001', compName: 'Apex Logistics Global' },
      { custCode: 'CUST-002', compName: 'Atlantic Freight LLC' },
      { custCode: 'CUST-003', compName: 'Pacific Maritime Corp' },
    ],
    activeSubCustomer: 'CUST-001',
    allowedUserCount: 5,
    createdUserCount: 2,
    allowedModules: ['dashboard', 'schedules', 'tracking', 'rates', 'booking', 'si', 'vgm', 'bl', 'do', 'arrival-notice', 'cro', 'user-creation', 'vendor-approvals', 'payments', 'customer-stmt', 'carbon', 'contact-us'],
  },
};

// ---------------------------------------------------------------------------
// MSW Handlers
// ---------------------------------------------------------------------------
export const landingHandlers = [
  // Port search
  http.get('/api/ports/search', ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const results = MOCK_PORTS.filter(
      (p) =>
        p.portCode.toLowerCase().includes(q) ||
        p.portName.toLowerCase().includes(q)
    );
    return HttpResponse.json({ data: results });
  }),

  // Equipment types
  http.get('/api/equipment-types', () => {
    return HttpResponse.json({ data: MOCK_EQUIPMENT_TYPES });
  }),

  // Tab config (menu access)
  http.get('/api/config/menu-access', () => {
    return HttpResponse.json({ data: MOCK_TAB_CONFIG });
  }),

  // Captcha image — return a simple placeholder SVG
  http.get('/api/captcha/image', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="44" viewBox="0 0 140 44">
      <rect width="140" height="44" fill="#f0f4f8"/>
      <text x="70" y="28" font-family="monospace" font-size="18" font-weight="bold"
            fill="#1677ff" text-anchor="middle" letter-spacing="6">A8K2F</text>
    </svg>`;
    return new HttpResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }),

  // Captcha validation
  http.get('/api/captcha/validate', () => {
    return HttpResponse.json({ valid: true });
  }),

  // Login — mock success/failure
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { userName: string; password: string };
    const u = body.userName.toLowerCase().trim();

    // Simulate invalid credentials
    if (u === 'invalid' || body.password === '') {
      return HttpResponse.json(
        { message: 'Invalid Username / Password' },
        { status: 401 }
      );
    }

    if (u.includes('superuser') || u.includes('master')) {
      return HttpResponse.json({ data: MOCK_SUPERUSER_USER });
    }

    if (u.includes('admin')) {
      return HttpResponse.json({ data: MOCK_ADMIN_USER });
    }

    // Match tenant username patterns
    if (u.includes('tenant2') || u.includes('cust002') || u.includes('pacific')) {
      return HttpResponse.json({ data: MOCK_TENANT_USERS.TENANT_02 });
    }
    if (u.includes('tenant3') || u.includes('cust003') || u.includes('global')) {
      return HttpResponse.json({ data: MOCK_TENANT_USERS.TENANT_03 });
    }
    if (u.includes('tenant4') || u.includes('cust004') || u.includes('apex')) {
      return HttpResponse.json({ data: MOCK_TENANT_USERS.TENANT_04 });
    }
    if (u.includes('tenant5') || u.includes('cust005') || u.includes('orient')) {
      return HttpResponse.json({ data: MOCK_TENANT_USERS.TENANT_05 });
    }
    if (u.includes('tenant6') || u.includes('cust006') || u.includes('nordic')) {
      return HttpResponse.json({ data: MOCK_TENANT_USERS.TENANT_06 });
    }
    if (u.includes('tenant7') || u.includes('cust007') || u.includes('atlantic')) {
      return HttpResponse.json({ data: MOCK_TENANT_USERS.TENANT_07 });
    }
    if (u.includes('tenant8') || u.includes('cust008') || u.includes('equator')) {
      return HttpResponse.json({ data: MOCK_TENANT_USERS.TENANT_08 });
    }
    if (u.includes('tenant9') || u.includes('cust009') || u.includes('oceanic')) {
      return HttpResponse.json({ data: MOCK_TENANT_USERS.TENANT_09 });
    }
    if (u.includes('tenant10') || u.includes('cust010') || u.includes('solverminds')) {
      return HttpResponse.json({ data: MOCK_TENANT_USERS.TENANT_10 });
    }

    // Default to Tenant 01 (SVM Shipping Lines)
    return HttpResponse.json({ data: MOCK_TENANT_USERS.TENANT_01 });
  }),
];
