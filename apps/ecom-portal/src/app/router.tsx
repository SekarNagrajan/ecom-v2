// Modified by Sekar Nagarajan (2026-08-27 13:05)
import { useAuthStore } from "@solverminds/auth";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { AuthenticatedLayout } from "../components/layout/AuthenticatedLayout";
import { PublicLayout } from "../components/layout/PublicLayout";
import { AdminRoute } from "../features/admin/admin-route";
import {
  DEFAULT_ADMIN_SECTION,
  isAdminSectionKey,
  resolveAllowedAdminSections,
  resolveDefaultAdminSection,
  type AdminSectionKey,
} from "../features/admin/utils/admin-menu-access";
import { ArrivalNoticeRoute } from "../features/arrival-notice/arrival-notice-route";
import { ActivationRoute } from "../features/auth/activation-route";
import { AdminLoginPage } from "../features/auth/components/admin-login-page";
import { ImpersonationLoginPage } from "../features/auth/components/impersonation-login-page";
import { VendorLoginPage } from "../features/auth/components/vendor-login-page";
import { BillOfLadingBatchPrintRoute } from "../features/bill-of-lading/bill-of-lading-batch-print-route";
import { BillOfLadingDashboardRoute } from "../features/bill-of-lading/bill-of-lading-dashboard-route";
import {
  BillOfLadingMcnListRoute,
  BillOfLadingMcnViewRoute,
} from "../features/bill-of-lading/bill-of-lading-mcn-route";
import { BillOfLadingMcnEditRoute } from "../features/bill-of-lading/bill-of-lading-mcn-edit-route";
import { BillOfLadingViewRoute } from "../features/bill-of-lading/bill-of-lading-view-route";
import { BillOfLadingWizardRoute } from "../features/bill-of-lading/bill-of-lading-wizard-route";
import { BillOfLadingSubmitResultRoute } from "../features/bill-of-lading/bill-of-lading-submit-result-route";
import { BookingAmendRoute } from "../features/booking/booking-amend-route";
import { BookingDashboardRoute } from "../features/booking/booking-dashboard-route";
import { BookingViewRoute } from "../features/booking/booking-view-route";
import { BookingWizardRoute } from "../features/booking/booking-wizard-route";
import { CarbonCalculatorRoute } from "../features/carbon-calculator/carbon-calculator-route";
import { ContactUsRoute } from "../features/contact-us/contact-us-route";
import { ContainerReleaseOrderRoute } from "../features/container-release-order/container-release-order-route";
import { CustomerStatementRoute } from "../features/customer-statement/customer-statement-route";
import { EnhancedDashboardView } from "../features/dashboard/components/EnhancedDashboardView";
import { DeliveryOrderRoute } from "../features/delivery-order/delivery-order-route";
import { RatesRoute } from "../features/rates/rates-route";
import { RegistrationRoute } from "../features/registration/registration-route";
import { SchedulesRoute } from "../features/schedules/schedules-route";
import { ShippingInstructionDashboardRoute } from "../features/shipping-instruction/shipping-instruction-dashboard-route";
import { ShippingInstructionViewRoute } from "../features/shipping-instruction/shipping-instruction-view-route";
import { ShippingInstructionWizardRoute } from "../features/shipping-instruction/shipping-instruction-wizard-route";
import { TrackingRoute } from "../features/tracking/tracking-route";
import { userCreationRoute } from "../features/user-creation/user-creation-route";
import {
  ChangePasswordRoute,
  MyAlertsRoute,
  PaymentHistoryRoute,
  ProfileRoute,
  QuotesRoute,
} from "../features/user-modules/user-modules-routes";
import { vendorApprovalsRoute } from "../features/vendor-approvals/vendor-approvals-route";
import { VgmDashboardRoute } from "../features/vgm/vgm-dashboard-route";

// ---------------------------------------------------------------------------
// Route guard helpers
// ---------------------------------------------------------------------------

function requireAuth() {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({ to: "/", search: { login: true } as never });
  }
}

function assertCapability(code: string) {
  return () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      throw redirect({ to: "/", search: { login: true } as never });
    }
    if (user.role === "ADMIN" || user.isSessionAdmin || user.isImpersonating) {
      return;
    }
    if (!user.capabilities.includes(code)) {
      throw redirect({ to: "/app/dashboard" });
    }
  };
}

function assertAdminAccess() {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw redirect({ to: "/", search: { login: true } as never });
  }
  if (user.role !== "ADMIN") {
    throw redirect({ to: "/app/dashboard" });
  }
}

function assertVendorAccess() {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw redirect({ to: "/", search: { login: true } as never });
  }
  if (user.role !== "VENDOR" && user.role !== "ADMIN") {
    throw redirect({ to: "/app/dashboard" });
  }
}

function assertSuperuserAccess() {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw redirect({ to: "/", search: { login: true } as never });
  }
  if (!user.isSessionAdmin && user.role !== "ADMIN") {
    throw redirect({ to: "/app/dashboard" });
  }
}

// ---------------------------------------------------------------------------
// 1. Root Route
// ---------------------------------------------------------------------------
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// ---------------------------------------------------------------------------
// 2. Public Layout Route
// ---------------------------------------------------------------------------
const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public",
  component: () => <PublicLayout />,
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/app/dashboard" });
    }
  },
});

const indexRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>) => ({
    login: search.login as boolean | undefined,
  }),
  component: () => null,
});

const registerRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/register",
  component: () => (
    <RegistrationRoute onCancel={() => window.history.back()} />
  ),
});

const activationRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/activation",
  component: () => (
    <ActivationRoute onProceedToLogin={() => window.history.back()} />
  ),
});

const contactUsRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/contact-us",
  validateSearch: (search: Record<string, unknown>) => ({
    fromRegistration: search.fromRegistration as string | undefined,
  }),
  component: () => <ContactUsRoute />,
});

// ---------------------------------------------------------------------------
// 2.5 Admin / Vendor / Impersonation Login Pages (public, standalone)
// ---------------------------------------------------------------------------
const cpanelLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cpanel",
  component: () => <AdminLoginPage />,
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({
        to: "/app/admin",
        search: { section: DEFAULT_ADMIN_SECTION } as never,
      });
    }
  },
});

const eadminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/eadmin",
  component: () => <VendorLoginPage />,
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/app/vendor-approvals" });
    }
  },
});

// Modified by Sekar Nagarajan (2026-08-27 11:41)
// Legacy parity: /admin (not /admin-login) for impersonation entry
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => <ImpersonationLoginPage />,
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/app/dashboard" });
    }
  },
});

// ---------------------------------------------------------------------------
// 3. Authenticated Layout Route
// ---------------------------------------------------------------------------
export const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: () => <AuthenticatedLayout />,
  beforeLoad: ({ location }) => {
    const isPublicSearchModule =
      location.pathname.startsWith("/app/schedules") ||
      location.pathname.startsWith("/app/tracking") ||
      location.pathname.startsWith("/app/rates");

    if (!useAuthStore.getState().isAuthenticated && !isPublicSearchModule) {
      throw redirect({ to: "/", search: { login: true } as never });
    }
  },
});

// 3.1 Dashboard — auth required, no capability
const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/dashboard",
  beforeLoad: requireAuth,
  component: EnhancedDashboardView,
});

// 3.2 Schedules (public search)
const schedulesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/schedules",
  component: () => <SchedulesRoute />,
});

// 3.3 Tracking (public search)
const trackingRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/tracking",
  component: () => <TrackingRoute />,
});

// 3.4 Rates (public search)
const ratesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/rates",
  component: () => <RatesRoute />,
});

// 3.5 System Admin Control Panel — ADMIN only
const adminRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/admin",
  validateSearch: (search: Record<string, unknown>): {
    section: AdminSectionKey;
  } => ({
    section: isAdminSectionKey(search.section)
      ? search.section
      : DEFAULT_ADMIN_SECTION,
  }),
  beforeLoad: ({ search }) => {
    assertAdminAccess();
    const user = useAuthStore.getState().user;
    const allowed = resolveAllowedAdminSections(user?.vendorMenuList);
    const fallback = resolveDefaultAdminSection(allowed);
    const section =
      allowed.includes(search.section) ? search.section : fallback;
    if (section !== search.section) {
      throw redirect({
        to: "/app/admin",
        search: { section } as never,
      });
    }
  },
  component: () => <AdminRoute />,
});

// 3.6 Booking — capability BKG
const bookingDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/booking",
  beforeLoad: assertCapability("BKG"),
  component: () => <BookingDashboardRoute />,
});

const bookingWizardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/booking/new",
  beforeLoad: assertCapability("BKG"),
  component: () => <BookingWizardRoute />,
});

const bookingViewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/booking/$bookingId",
  beforeLoad: assertCapability("BKG"),
  component: () => <BookingViewRoute />,
});

const bookingAmendRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/booking/$bookingId/amend",
  beforeLoad: assertCapability("BKG"),
  component: () => <BookingAmendRoute />,
});

// 3.7 Shipping Instruction — capability SI
const shippingInstructionDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/shipping-instruction",
  beforeLoad: assertCapability("SI"),
  component: () => <ShippingInstructionDashboardRoute />,
});

const shippingInstructionWizardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/shipping-instruction/wizard/$id",
  beforeLoad: assertCapability("SI"),
  component: () => <ShippingInstructionWizardRoute />,
});

const shippingInstructionViewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/shipping-instruction/$siId",
  beforeLoad: assertCapability("SI"),
  component: () => <ShippingInstructionViewRoute />,
});

// 3.8 VGM — capability VGM
const vgmDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/vgm",
  beforeLoad: assertCapability("VGM"),
  component: () => <VgmDashboardRoute />,
});

// 3.9 Bill of Lading — capability BL
const blDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl",
  beforeLoad: assertCapability("BL"),
  component: () => <BillOfLadingDashboardRoute />,
});

const blViewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/$blNo",
  beforeLoad: assertCapability("BL"),
  component: () => <BillOfLadingViewRoute />,
});

const blWizardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/$blNo/edit",
  beforeLoad: assertCapability("BL"),
  component: () => <BillOfLadingWizardRoute />,
});

const blSubmitResultRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/$blNo/submit-result",
  beforeLoad: assertCapability("BL"),
  component: () => <BillOfLadingSubmitResultRoute />,
});

const blMcnEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/mcn/$mcnId/edit",
  beforeLoad: assertCapability("BL"),
  component: () => <BillOfLadingMcnEditRoute />,
});

const blBatchPrintRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/batch-print",
  beforeLoad: assertCapability("BL"),
  component: () => <BillOfLadingBatchPrintRoute />,
});

const blMcnListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/mcn",
  beforeLoad: assertCapability("BL"),
  component: () => <BillOfLadingMcnListRoute />,
});

const blMcnViewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/mcn/$mcnId",
  beforeLoad: assertCapability("BL"),
  component: () => <BillOfLadingMcnViewRoute />,
});

// 3.10 Delivery Order — capability DO
const deliveryOrderRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/delivery-order",
  beforeLoad: assertCapability("DO"),
  component: DeliveryOrderRoute,
});

// 3.11 Container Release Order — capability CRO
const containerReleaseOrderRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/cro",
  beforeLoad: assertCapability("CRO"),
  component: ContainerReleaseOrderRoute,
});

// 3.12 Arrival Notice — capability ARN
const arrivalNoticeRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/arrival-notice",
  beforeLoad: assertCapability("ARN"),
  component: ArrivalNoticeRoute,
});

// 3.13 Customer Statement — capability STMT (isTenantAdmin also bypasses)
const customerStatementRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/customer-stmt",
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      throw redirect({ to: "/", search: { login: true } as never });
    }
    const allowed =
      user.role === "ADMIN" ||
      user.isTenantAdmin ||
      user.isSessionAdmin ||
      user.isImpersonating ||
      user.capabilities.includes("STMT");
    if (!allowed) {
      throw redirect({ to: "/app/dashboard" });
    }
  },
  component: CustomerStatementRoute,
});

// 3.14 Carbon Calculator — capability CO2 (isTenantAdmin also bypasses)
const carbonCalculatorRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/carbon",
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      throw redirect({ to: "/", search: { login: true } as never });
    }
    const allowed =
      user.role === "ADMIN" ||
      user.isTenantAdmin ||
      user.isSessionAdmin ||
      user.isImpersonating ||
      user.capabilities.includes("CO2");
    if (!allowed) {
      throw redirect({ to: "/app/dashboard" });
    }
  },
  component: CarbonCalculatorRoute,
});

// 3.15 Payment History — capability PAY
const paymentsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/payments",
  beforeLoad: assertCapability("PAY"),
  component: () => <PaymentHistoryRoute />,
});

// 3.18 User profile routes — auth required, no capability
const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/profile",
  beforeLoad: requireAuth,
  component: () => <ProfileRoute />,
});

const changePasswordRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/change-password",
  beforeLoad: requireAuth,
  component: () => <ChangePasswordRoute />,
});

const quotesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/quotes",
  beforeLoad: requireAuth,
  component: () => <QuotesRoute />,
});

const myAlertsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/my-alerts",
  beforeLoad: requireAuth,
  component: () => <MyAlertsRoute />,
});

// ---------------------------------------------------------------------------
// 4. Route Tree
// ---------------------------------------------------------------------------
const routeTree = rootRoute.addChildren([
  publicRoute.addChildren([
    indexRoute,
    registerRoute,
    activationRoute,
    contactUsRoute,
  ]),
  cpanelLoginRoute,
  eadminLoginRoute,
  adminLoginRoute,
  appRoute.addChildren([
    dashboardRoute,
    schedulesRoute,
    trackingRoute,
    ratesRoute,
    bookingDashboardRoute,
    bookingWizardRoute,
    bookingViewRoute,
    bookingAmendRoute,
    shippingInstructionDashboardRoute,
    shippingInstructionWizardRoute,
    shippingInstructionViewRoute,
    vgmDashboardRoute,
    blDashboardRoute,
    blBatchPrintRoute,
    blMcnListRoute,
    blMcnViewRoute,
    blMcnEditRoute,
    blWizardRoute,
    blSubmitResultRoute,
    blViewRoute,
    deliveryOrderRoute,
    containerReleaseOrderRoute,
    arrivalNoticeRoute,
    customerStatementRoute,
    carbonCalculatorRoute,
    adminRoute,
    userCreationRoute,
    vendorApprovalsRoute,
    profileRoute,
    changePasswordRoute,
    quotesRoute,
    myAlertsRoute,
    paymentsRoute,
  ]),
]);

// ---------------------------------------------------------------------------
// 5. Create Router
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const router = createRouter({ routeTree } as any);

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
