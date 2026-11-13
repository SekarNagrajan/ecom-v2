// Modified by Sekar Nagarajan (2026-11-13 01:10)
import { create } from "zustand";

export interface TenantConfig {
  id: string;
  name: string;
  customerCode: string;
  /** Full logo for the sidebar / public header; empty = house logo. */
  logoUrl: string;
  /** Optional per-tenant favicon; empty = the default mark. */
  faviconUrl?: string;
  /** Brand accent. Applied unless the user picked their own accent in Preferences. */
  primaryColor: string;
  features: {
    defaultLandingRoute: string; // '/app/dashboard' or '/app/booking'
    enableInsurance: boolean;
    enableProductDashboard: boolean;
    customerStatementEngine: "INVOICE" | "SP" | "STANDARD";
    allowedModules: string[]; // e.g. ['dashboard', 'schedules', 'tracking', 'rates', 'booking', 'si', 'vgm', 'bl', 'do', 'arrival-notice', 'cro', 'payments', 'customer-stmt', 'carbon', 'contact-us']
  };
}

export const PRECONFIGURED_TENANTS: Record<string, TenantConfig> = {
  TENANT_01: {
    id: "TENANT_01",
    name: "SVM E-Commerce Portal",
    customerCode: "CUST001",
    // The default tenant is the house brand: same logo and Signal Blue accent the portal ships with.
    logoUrl: "/logo.png",
    primaryColor: "#0a91ff",
    features: {
      defaultLandingRoute: "/app/dashboard",
      enableInsurance: true,
      enableProductDashboard: true,
      customerStatementEngine: "INVOICE",
      allowedModules: [
        "dashboard",
        "schedules",
        "tracking",
        "rates",
        "booking",
        "si",
        "vgm",
        "bl",
        "do",
        "arrival-notice",
        "cro",
        "payments",
        "customer-stmt",
        "carbon",
        "contact-us",
      ],
    },
  },
  TENANT_02: {
    id: "TENANT_02",
    name: "Pacific Maritime Line",
    customerCode: "CUST002",
    logoUrl: "/logos/tenant_02.png",
    primaryColor: "#0050b3",
    features: {
      defaultLandingRoute: "/app/booking",
      enableInsurance: false,
      enableProductDashboard: true,
      customerStatementEngine: "SP",
      allowedModules: [
        "dashboard",
        "schedules",
        "tracking",
        "rates",
        "booking",
        "si",
        "vgm",
        "bl",
        "do",
        "payments",
        "contact-us",
      ],
    },
  },
  TENANT_03: {
    id: "TENANT_03",
    name: "Global Cargo Logistics",
    customerCode: "CUST003",
    logoUrl: "/logos/tenant_03.png",
    primaryColor: "#389e0d",
    features: {
      defaultLandingRoute: "/app/dashboard",
      enableInsurance: true,
      enableProductDashboard: false,
      customerStatementEngine: "STANDARD",
      allowedModules: ["dashboard", "schedules", "tracking", "booking", "si", "bl", "payments"],
    },
  },
  TENANT_04: {
    id: "TENANT_04",
    name: "Apex Express Container",
    customerCode: "CUST004",
    logoUrl: "/logos/tenant_04.png",
    primaryColor: "#d4b106",
    features: {
      defaultLandingRoute: "/app/dashboard",
      enableInsurance: false,
      enableProductDashboard: true,
      customerStatementEngine: "INVOICE",
      allowedModules: ["dashboard", "schedules", "tracking", "rates", "booking", "vgm", "bl", "do"],
    },
  },
  TENANT_05: {
    id: "TENANT_05",
    name: "Orient Trans Freight",
    customerCode: "CUST005",
    logoUrl: "/logos/tenant_05.png",
    primaryColor: "#531dab",
    features: {
      defaultLandingRoute: "/app/booking",
      enableInsurance: true,
      enableProductDashboard: true,
      customerStatementEngine: "SP",
      allowedModules: [
        "dashboard",
        "schedules",
        "tracking",
        "rates",
        "booking",
        "si",
        "vgm",
        "bl",
        "do",
        "arrival-notice",
        "cro",
        "payments",
        "customer-stmt",
        "carbon",
        "contact-us",
      ],
    },
  },
  TENANT_06: {
    id: "TENANT_06",
    name: "Nordic Seas Line",
    customerCode: "CUST006",
    logoUrl: "/logos/tenant_06.png",
    primaryColor: "#096dd9",
    features: {
      defaultLandingRoute: "/app/dashboard",
      enableInsurance: false,
      enableProductDashboard: true,
      customerStatementEngine: "STANDARD",
      allowedModules: ["dashboard", "schedules", "tracking", "booking", "si", "vgm", "bl", "do"],
    },
  },
  TENANT_07: {
    id: "TENANT_07",
    name: "Atlantic Hub Logistics",
    customerCode: "CUST007",
    logoUrl: "/logos/tenant_07.png",
    primaryColor: "#cf1322",
    features: {
      defaultLandingRoute: "/app/dashboard",
      enableInsurance: true,
      enableProductDashboard: false,
      customerStatementEngine: "INVOICE",
      allowedModules: [
        "dashboard",
        "schedules",
        "tracking",
        "rates",
        "booking",
        "si",
        "bl",
        "payments",
      ],
    },
  },
  TENANT_08: {
    id: "TENANT_08",
    name: "Equator Freight Express",
    customerCode: "CUST008",
    logoUrl: "/logos/tenant_08.png",
    primaryColor: "#08979c",
    features: {
      defaultLandingRoute: "/app/booking",
      enableInsurance: false,
      enableProductDashboard: true,
      customerStatementEngine: "SP",
      allowedModules: [
        "dashboard",
        "schedules",
        "tracking",
        "rates",
        "booking",
        "si",
        "vgm",
        "bl",
        "do",
        "payments",
      ],
    },
  },
  TENANT_09: {
    id: "TENANT_09",
    name: "Oceanic Trade & Shipping",
    customerCode: "CUST009",
    logoUrl: "/logos/tenant_09.png",
    primaryColor: "#d4380d",
    features: {
      defaultLandingRoute: "/app/dashboard",
      enableInsurance: true,
      enableProductDashboard: true,
      customerStatementEngine: "INVOICE",
      allowedModules: [
        "dashboard",
        "schedules",
        "tracking",
        "rates",
        "booking",
        "si",
        "vgm",
        "bl",
        "do",
        "cro",
        "payments",
      ],
    },
  },
  TENANT_10: {
    id: "TENANT_10",
    name: "Solverminds Corp Client",
    customerCode: "CUST010",
    logoUrl: "/logos/tenant_10.png",
    primaryColor: "#1d39c4",
    features: {
      defaultLandingRoute: "/app/dashboard",
      enableInsurance: true,
      enableProductDashboard: true,
      customerStatementEngine: "SP",
      allowedModules: [
        "dashboard",
        "schedules",
        "tracking",
        "rates",
        "booking",
        "si",
        "vgm",
        "bl",
        "do",
        "arrival-notice",
        "cro",
        "payments",
        "customer-stmt",
        "carbon",
        "contact-us",
      ],
    },
  },
};

/** Where the active tenant came from: the public tenant API (authoritative) or a local preset. */
export type TenantSource = "api" | "preset";

interface TenantState {
  activeTenant: TenantConfig;
  source: TenantSource;
  /**
   * Switch to a preset by id. A no-op when that tenant is already active, so a login or session
   * rehydrate never replaces the API-loaded tenant (with its real logo/colour) by the preset of
   * the same id. Unknown ids keep the current tenant.
   */
  setTenant: (tenantId: string) => void;
  /** Install the tenant returned by GET /api/public/tenant. */
  setCustomTenant: (tenant: TenantConfig) => void;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  activeTenant: PRECONFIGURED_TENANTS.TENANT_01,
  source: "preset",
  setTenant: (tenantId: string) => {
    const { activeTenant } = get();
    if (!tenantId || tenantId === activeTenant.id) return;
    const tenant = PRECONFIGURED_TENANTS[tenantId];
    if (!tenant) return;
    set({ activeTenant: tenant, source: "preset" });
  },
  setCustomTenant: (tenant: TenantConfig) => {
    set({ activeTenant: tenant, source: "api" });
  },
}));
