// Modified by Sekar Nagarajan (2026-11-12 23:50)
import { useAuthStore, useTenantStore } from "@solverminds/auth";
import { env, queryClient } from "@solverminds/platform";
import {
  createRootRoute,
  createRoute,
  createRouter,
  isRedirect,
  lazyRouteComponent,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { RootErrorComponent } from "../components/error/root-error";
import { AuthenticatedLayout } from "../components/layout/AuthenticatedLayout";
import { LayoutSkeleton } from "../components/layout/layout-skeleton";
import { PublicLayout } from "../components/layout/PublicLayout";
import { AppRoutePendingFallback } from "../components/pending/app-route-pending";
import { PublicPendingFallback } from "../components/pending/public-pending";
import { NotFound } from "../components/shared/not-found";
import { adminRoute } from "../features/admin/admin-route";
import { resolveAdminLandingSearch } from "../features/admin/utils/admin-landing";
import { rehydrateSession } from "../features/auth/api/rehydrate-session";
import { SESSION_EXPIRED_SEARCH_REASON } from "../features/auth/api/session-expiry";
import { redirectForMissingCapability } from "../features/auth/utils/capability-guard";
import { AdminLoginPage } from "../features/auth/components/admin-login-page";
import { ImpersonationLoginPage } from "../features/auth/components/impersonation-login-page";
import { VendorLoginPage } from "../features/auth/components/vendor-login-page";
import { publicTenantQueryOptions } from "../features/tenant/api/tenant.queries";
import { userCreationRoute } from "../features/user-creation/user-creation-route";
import { vendorApprovalsRoute } from "../features/vendor-approvals/vendor-approvals-route";

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
    if (
      user.role === "ADMIN" ||
      user.isTenantAdmin ||
      user.isSessionAdmin ||
      user.isImpersonating
    ) {
      return;
    }
    if (!user.capabilities.includes(code)) {
      redirectForMissingCapability(`You do not have access to this module (${code}).`);
    }
  };
}

export function assertAdminAccess() {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw redirect({ to: "/", search: { login: true } as never });
  }
  if (user.role !== "ADMIN") {
    redirectForMissingCapability("You do not have access to the admin control panel.");
  }
}

function assertVendorAccess() {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw redirect({ to: "/", search: { login: true } as never });
  }
  if (user.role !== "VENDOR" && user.role !== "ADMIN") {
    redirectForMissingCapability("You do not have vendor access.");
  }
}

function assertSuperuserAccess() {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw redirect({ to: "/", search: { login: true } as never });
  }
  if (!user.isSessionAdmin && user.role !== "ADMIN") {
    redirectForMissingCapability("You do not have superuser access.");
  }
}

function resolveSessionSplashTitle(): string {
  const tenantName = useTenantStore.getState().activeTenant?.name;
  return tenantName || env.VITE_APP_TITLE;
}

// ---------------------------------------------------------------------------
// 0. Lazy feature pages
// ---------------------------------------------------------------------------
// Every feature page is its own chunk, fetched on first navigation (and preloaded on hover
// through `defaultPreload: "intent"`). Layouts, login pages and fallbacks stay eager so the
// first paint needs nothing but the entry bundle. Keep the admin pattern in features/admin.

const RegistrationPage = lazyRouteComponent(
  () => import("../features/registration/registration-route"),
  "RegistrationRoute",
);
const ActivationPage = lazyRouteComponent(
  () => import("../features/auth/activation-route"),
  "ActivationRoute",
);
const ContactUsPage = lazyRouteComponent(
  () => import("../features/contact-us/contact-us-route"),
  "ContactUsRoute",
);
const DashboardPage = lazyRouteComponent(
  () => import("../features/dashboard/components/EnhancedDashboardView"),
  "EnhancedDashboardView",
);
const SchedulesPage = lazyRouteComponent(
  () => import("../features/schedules/schedules-route"),
  "SchedulesRoute",
);
const TrackingPage = lazyRouteComponent(
  () => import("../features/tracking/tracking-route"),
  "TrackingRoute",
);
const RatesPage = lazyRouteComponent(() => import("../features/rates/rates-route"), "RatesRoute");
const BookingDashboardPage = lazyRouteComponent(
  () => import("../features/booking/booking-dashboard-route"),
  "BookingDashboardRoute",
);
const BookingImportPage = lazyRouteComponent(
  () => import("../features/booking-import/booking-import-route"),
  "BookingImportRoute",
);
const BookingWizardPage = lazyRouteComponent(
  () => import("../features/booking/booking-wizard-route"),
  "BookingWizardRoute",
);
const BookingViewPage = lazyRouteComponent(
  () => import("../features/booking/booking-view-route"),
  "BookingViewRoute",
);
const BookingAmendPage = lazyRouteComponent(
  () => import("../features/booking/booking-amend-route"),
  "BookingAmendRoute",
);
const ShippingInstructionDashboardPage = lazyRouteComponent(
  () => import("../features/shipping-instruction/shipping-instruction-dashboard-route"),
  "ShippingInstructionDashboardRoute",
);
const ShippingInstructionWizardPage = lazyRouteComponent(
  () => import("../features/shipping-instruction/shipping-instruction-wizard-route"),
  "ShippingInstructionWizardRoute",
);
const ShippingInstructionViewPage = lazyRouteComponent(
  () => import("../features/shipping-instruction/shipping-instruction-view-route"),
  "ShippingInstructionViewRoute",
);
const VgmDashboardPage = lazyRouteComponent(
  () => import("../features/vgm/vgm-dashboard-route"),
  "VgmDashboardRoute",
);
const BillOfLadingDashboardPage = lazyRouteComponent(
  () => import("../features/bill-of-lading/bill-of-lading-dashboard-route"),
  "BillOfLadingDashboardRoute",
);
const BillOfLadingViewPage = lazyRouteComponent(
  () => import("../features/bill-of-lading/bill-of-lading-view-route"),
  "BillOfLadingViewRoute",
);
const BillOfLadingWizardPage = lazyRouteComponent(
  () => import("../features/bill-of-lading/bill-of-lading-wizard-route"),
  "BillOfLadingWizardRoute",
);
const BillOfLadingSubmitResultPage = lazyRouteComponent(
  () => import("../features/bill-of-lading/bill-of-lading-submit-result-route"),
  "BillOfLadingSubmitResultRoute",
);
const BillOfLadingMcnEditPage = lazyRouteComponent(
  () => import("../features/bill-of-lading/bill-of-lading-mcn-edit-route"),
  "BillOfLadingMcnEditRoute",
);
const BillOfLadingBatchPrintPage = lazyRouteComponent(
  () => import("../features/bill-of-lading/bill-of-lading-batch-print-route"),
  "BillOfLadingBatchPrintRoute",
);
const BillOfLadingMcnListPage = lazyRouteComponent(
  () => import("../features/bill-of-lading/bill-of-lading-mcn-route"),
  "BillOfLadingMcnListRoute",
);
const BillOfLadingMcnViewPage = lazyRouteComponent(
  () => import("../features/bill-of-lading/bill-of-lading-mcn-route"),
  "BillOfLadingMcnViewRoute",
);
const DeliveryOrderPage = lazyRouteComponent(
  () => import("../features/delivery-order/delivery-order-route"),
  "DeliveryOrderRoute",
);
const ContainerReleaseOrderPage = lazyRouteComponent(
  () => import("../features/container-release-order/container-release-order-route"),
  "ContainerReleaseOrderRoute",
);
const ArrivalNoticePage = lazyRouteComponent(
  () => import("../features/arrival-notice/arrival-notice-route"),
  "ArrivalNoticeRoute",
);
const CustomerStatementPage = lazyRouteComponent(
  () => import("../features/customer-statement/customer-statement-route"),
  "CustomerStatementRoute",
);
const CarbonCalculatorPage = lazyRouteComponent(
  () => import("../features/carbon-calculator/carbon-calculator-route"),
  "CarbonCalculatorRoute",
);
const PaymentHistoryPage = lazyRouteComponent(
  () => import("../features/user-modules/user-modules-routes"),
  "PaymentHistoryRoute",
);
const ProfilePage = lazyRouteComponent(
  () => import("../features/user-modules/user-modules-routes"),
  "ProfileRoute",
);
const ChangePasswordPage = lazyRouteComponent(
  () => import("../features/user-modules/user-modules-routes"),
  "ChangePasswordRoute",
);
const QuotesPage = lazyRouteComponent(
  () => import("../features/user-modules/user-modules-routes"),
  "QuotesRoute",
);
const MyAlertsPage = lazyRouteComponent(
  () => import("../features/user-modules/user-modules-routes"),
  "MyAlertsRoute",
);

// ---------------------------------------------------------------------------
// 1. Root Route
// ---------------------------------------------------------------------------
const rootRoute = createRootRoute({
  beforeLoad: async () => {
    await rehydrateSession();

    try {
      const tenant = await queryClient.ensureQueryData(publicTenantQueryOptions());
      useTenantStore.getState().setCustomTenant(tenant);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw error instanceof Error
        ? error
        : new Error(
            "Failed to load organization configuration. Please refresh the page or contact support.",
          );
    }
  },
  pendingComponent: () => (
    <PublicPendingFallback
      title={resolveSessionSplashTitle()}
      message="Verifying your session..."
    />
  ),
  errorComponent: ({ error, reset }) => <RootErrorComponent error={error} reset={reset} />,
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
    reason:
      search.reason === SESSION_EXPIRED_SEARCH_REASON ? SESSION_EXPIRED_SEARCH_REASON : undefined,
  }),
  component: () => null,
});

const registerRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/register",
  component: () => <RegistrationPage onCancel={() => window.history.back()} />,
});

const activationRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/activation",
  component: () => <ActivationPage onProceedToLogin={() => window.history.back()} />,
});

const contactUsRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/contact-us",
  validateSearch: (search: Record<string, unknown>) => ({
    fromRegistration: search.fromRegistration as string | undefined,
  }),
  component: ContactUsPage,
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
        search: resolveAdminLandingSearch() as never,
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
  pendingComponent: () => <LayoutSkeleton />,
  // Avoid full-layout skeleton flash for fast SPA navigations (landing search)
  pendingMs: 400,
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
  pendingComponent: () => <AppRoutePendingFallback />,
  component: DashboardPage,
});

// 3.2 Schedules (public search)
const schedulesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/schedules",
  pendingComponent: () => <AppRoutePendingFallback />,
  component: SchedulesPage,
});

// 3.3 Tracking (public search)
const trackingRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/tracking",
  pendingComponent: () => <AppRoutePendingFallback />,
  component: TrackingPage,
});

// 3.4 Rates (public search)
const ratesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/rates",
  pendingComponent: () => <AppRoutePendingFallback />,
  component: RatesPage,
});

// 3.5 System Admin Control Panel — ADMIN only: owned by features/admin/admin-route.tsx

// 3.6 Booking — capability BKG
const bookingDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/booking",
  beforeLoad: assertCapability("BKG"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: BookingDashboardPage,
});

const bookingImportRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/booking/import",
  beforeLoad: assertCapability("BKG"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: BookingImportPage,
});

const bookingWizardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/booking/new",
  beforeLoad: assertCapability("BKG"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: BookingWizardPage,
});

const bookingViewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/booking/$bookingId",
  beforeLoad: assertCapability("BKG"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: BookingViewPage,
});

const bookingAmendRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/booking/$bookingId/amend",
  beforeLoad: assertCapability("BKG"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: BookingAmendPage,
});

// 3.7 Shipping Instruction — capability SI
const shippingInstructionDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/shipping-instruction",
  beforeLoad: assertCapability("SI"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: ShippingInstructionDashboardPage,
});

const shippingInstructionWizardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/shipping-instruction/wizard/$id",
  // Modified by Sekar Nagarajan (2026-09-01 12:41) — dashboard Create SI search seed
  validateSearch: (search: Record<string, unknown>) => ({
    fromDashboard:
      search.fromDashboard === true || search.fromDashboard === "true" ? true : undefined,
    onlineRefNo: typeof search.onlineRefNo === "string" ? search.onlineRefNo : undefined,
    origin: typeof search.origin === "string" ? search.origin : undefined,
    delivery: typeof search.delivery === "string" ? search.delivery : undefined,
    containerNo: typeof search.containerNo === "string" ? search.containerNo : undefined,
    blNo: typeof search.blNo === "string" ? search.blNo : undefined,
  }),
  beforeLoad: assertCapability("SI"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: ShippingInstructionWizardPage,
});

const shippingInstructionViewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/shipping-instruction/$siId",
  beforeLoad: assertCapability("SI"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: ShippingInstructionViewPage,
});

// 3.8 VGM — capability VGM
const vgmDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/vgm",
  beforeLoad: assertCapability("VGM"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: VgmDashboardPage,
});

// 3.9 Bill of Lading — capability BL
const blDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl",
  beforeLoad: assertCapability("BL"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: BillOfLadingDashboardPage,
});

const blViewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/$blNo",
  beforeLoad: assertCapability("BL"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: BillOfLadingViewPage,
});

const blWizardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/$blNo/edit",
  beforeLoad: assertCapability("BL"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: BillOfLadingWizardPage,
});

const blSubmitResultRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/$blNo/submit-result",
  beforeLoad: assertCapability("BL"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: BillOfLadingSubmitResultPage,
});

const blMcnEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/mcn/$mcnId/edit",
  beforeLoad: assertCapability("BL"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: BillOfLadingMcnEditPage,
});

const blBatchPrintRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/batch-print",
  beforeLoad: assertCapability("BL"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: BillOfLadingBatchPrintPage,
});

const blMcnListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/mcn",
  beforeLoad: assertCapability("BL"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: BillOfLadingMcnListPage,
});

const blMcnViewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/mcn/$mcnId",
  beforeLoad: assertCapability("BL"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: BillOfLadingMcnViewPage,
});

// 3.10 Delivery Order — capability DO
const deliveryOrderRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/delivery-order",
  beforeLoad: assertCapability("DO"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: DeliveryOrderPage,
});

// 3.11 Container Release Order — capability CRO
const containerReleaseOrderRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/cro",
  beforeLoad: assertCapability("CRO"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: ContainerReleaseOrderPage,
});

// 3.12 Arrival Notice — capability ARN
const arrivalNoticeRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/arrival-notice",
  beforeLoad: assertCapability("ARN"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: ArrivalNoticePage,
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
  pendingComponent: () => <AppRoutePendingFallback />,
  component: CustomerStatementPage,
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
  pendingComponent: () => <AppRoutePendingFallback />,
  component: CarbonCalculatorPage,
});

// 3.15 Payment History — capability PAY
const paymentsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/payments",
  beforeLoad: assertCapability("PAY"),
  pendingComponent: () => <AppRoutePendingFallback />,
  component: PaymentHistoryPage,
});

// 3.18 User profile routes — auth required, no capability
const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/profile",
  beforeLoad: requireAuth,
  pendingComponent: () => <AppRoutePendingFallback />,
  component: ProfilePage,
});

const changePasswordRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/change-password",
  beforeLoad: requireAuth,
  pendingComponent: () => <AppRoutePendingFallback />,
  component: ChangePasswordPage,
});

const quotesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/quotes",
  beforeLoad: requireAuth,
  pendingComponent: () => <AppRoutePendingFallback />,
  component: QuotesPage,
});

const myAlertsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/my-alerts",
  beforeLoad: requireAuth,
  pendingComponent: () => <AppRoutePendingFallback />,
  component: MyAlertsPage,
});

// ---------------------------------------------------------------------------
// 4. Route Tree
// ---------------------------------------------------------------------------
const routeTree = rootRoute.addChildren([
  publicRoute.addChildren([indexRoute, registerRoute, activationRoute, contactUsRoute]),
  cpanelLoginRoute,
  eadminLoginRoute,
  adminLoginRoute,
  appRoute.addChildren([
    dashboardRoute,
    schedulesRoute,
    trackingRoute,
    ratesRoute,
    bookingDashboardRoute,
    bookingImportRoute,
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

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadDelay: 200,
  defaultPendingMs: 200,
  defaultPendingMinMs: 300,
  defaultPendingComponent: () => <PublicPendingFallback message="Loading page..." />,
  defaultNotFoundComponent: () => <NotFound />,
} as any);

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
