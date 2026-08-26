// Modified by Sekar Nagarajan (2026-08-25 13:00)
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
import { ArrivalNoticeRoute } from "../features/arrival-notice/arrival-notice-route";
import { ActivationRoute } from "../features/auth/activation-route";
import { BookingDashboardRoute } from "../features/booking/booking-dashboard-route";
import { BookingWizardRoute } from "../features/booking/booking-wizard-route";
import { CarbonCalculatorRoute } from "../features/carbon-calculator/carbon-calculator-route";
import { ContactUsRoute } from "../features/contact-us/contact-us-route";
import { ContainerReleaseOrderRoute } from "../features/container-release-order/container-release-order-route";
import { CustomerStatementRoute } from "../features/customer-statement/customer-statement-route";
import { DeliveryOrderRoute } from "../features/delivery-order/delivery-order-route";
import { RegistrationRoute } from "../features/registration/registration-route";
import { SchedulesRoute } from "../features/schedules/schedules-route";
import { userCreationRoute } from "../features/user-creation/user-creation-route";
import { ChangePasswordView } from "../features/user-modules/components/ChangePasswordView";
import { MyAlertsView } from "../features/user-modules/components/MyAlertsView";
import { PaymentHistoryView } from "../features/user-modules/components/PaymentHistoryView";
import { ProfileView } from "../features/user-modules/components/ProfileView";
import { QuotesView } from "../features/user-modules/components/QuotesView";
import { vendorApprovalsRoute } from "../features/vendor-approvals/vendor-approvals-route";

// 1. Root Route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// 2. Public Layout Route
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

// 2.1 Landing Page
const indexRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>) => ({
    login: search.login as boolean | undefined,
  }),
  component: () => null,
});

// 2.2 Registration
const registerRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/register",
  component: () => <RegistrationRoute onCancel={() => window.history.back()} />,
});

// 2.3 Activation
const activationRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/activation",
  component: () => (
    <ActivationRoute onProceedToLogin={() => window.history.back()} />
  ),
});

// 2.4 Contact Us
const contactUsRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/contact-us",
  validateSearch: (search: Record<string, unknown>) => ({
    fromRegistration: search.fromRegistration as string | undefined,
  }),
  component: () => <ContactUsRoute />,
});

// 3. Authenticated Layout Route
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
      throw redirect({ to: "/", search: { login: true } as any });
    }
  },
});

// 3.1 Dashboard
import { EnhancedDashboardView } from "../features/dashboard/components/EnhancedDashboardView";

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/dashboard",
  component: EnhancedDashboardView,
});

// 3.2 Schedules
const schedulesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/schedules",
  component: () => <SchedulesRoute />,
});

// 3.3 System Admin Control Panel
const adminRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/admin",
  component: () => <AdminRoute />,
});

// 3.4 User Profile
const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/profile",
  component: () => <ProfileView />,
});

// 3.5 Change Password
const changePasswordRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/change-password",
  component: () => <ChangePasswordView />,
});

// 3.6 Quote / Rate Requests
const quotesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/quotes",
  component: () => <QuotesView />,
});

// 3.7 My Alert Preferences
const myAlertsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/my-alerts",
  component: () => <MyAlertsView />,
});

// 3.8 Payment History
const paymentsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/payments",
  component: () => <PaymentHistoryView />,
});

// 3.8 Delivery Order
const deliveryOrderRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/delivery-order",
  component: DeliveryOrderRoute,
});

function assertCROAccess() {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw redirect({ to: "/", search: { login: true } as never });
  }
  const allowed =
    user.role === "ADMIN" ||
    user.isSessionAdmin ||
    user.capabilities.includes("CRO");
  if (!allowed) {
    throw redirect({ to: "/app/dashboard" });
  }
}

// 3.8b Container Release Order
const containerReleaseOrderRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/cro",
  beforeLoad: assertCROAccess,
  component: ContainerReleaseOrderRoute,
});

function assertARNAccess() {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw redirect({ to: "/", search: { login: true } as never });
  }
  const allowed =
    user.role === "ADMIN" ||
    user.isSessionAdmin ||
    user.capabilities.includes("ARN");
  if (!allowed) {
    throw redirect({ to: "/app/dashboard" });
  }
}

// 3.8c Arrival Notice
const arrivalNoticeRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/arrival-notice",
  beforeLoad: assertARNAccess,
  component: ArrivalNoticeRoute,
});

function assertSTMTAccess() {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw redirect({ to: "/", search: { login: true } as never });
  }
  const allowed =
    user.role === "ADMIN" ||
    user.isTenantAdmin ||
    user.capabilities.includes("STMT");
  if (!allowed) {
    throw redirect({ to: "/app/dashboard" });
  }
}

// 3.8d Customer Statement
const customerStatementRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/customer-stmt",
  beforeLoad: assertSTMTAccess,
  component: CustomerStatementRoute,
});

function assertCO2Access() {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw redirect({ to: "/", search: { login: true } as never });
  }
  const allowed =
    user.role === "ADMIN" ||
    user.isTenantAdmin ||
    user.capabilities.includes("CO2");
  if (!allowed) {
    throw redirect({ to: "/app/dashboard" });
  }
}

// 3.8e Carbon Calculator
const carbonCalculatorRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/carbon",
  beforeLoad: assertCO2Access,
  component: CarbonCalculatorRoute,
});

import { RatesRoute } from "../features/rates/rates-route";
import { TrackingRoute } from "../features/tracking/tracking-route";

// 3.9 Cargo & Container Tracking
const trackingRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/tracking",
  component: () => <TrackingRoute />,
});

// 3.10 Rate Engine & Tariffs
const ratesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/rates",
  component: () => <RatesRoute />,
});

// 3.9 Booking
const bookingDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/booking",
  component: () => <BookingDashboardRoute />,
});

const bookingWizardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/booking/new",
  component: () => <BookingWizardRoute />,
});

import { BookingViewRoute } from "../features/booking/booking-view-route";
const bookingViewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/booking/$bookingId",
  component: () => <BookingViewRoute />,
});

import { BookingAmendRoute } from "../features/booking/booking-amend-route";
const bookingAmendRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/booking/$bookingId/amend",
  component: () => <BookingAmendRoute />,
});

// 3.10 Shipping Instruction
import { ShippingInstructionDashboardRoute } from "../features/shipping-instruction/shipping-instruction-dashboard-route";
const shippingInstructionDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/shipping-instruction",
  component: () => <ShippingInstructionDashboardRoute />,
});

import { ShippingInstructionWizardRoute } from "../features/shipping-instruction/shipping-instruction-wizard-route";
const shippingInstructionWizardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/shipping-instruction/wizard/$id",
  component: () => <ShippingInstructionWizardRoute />,
});

import { ShippingInstructionViewRoute } from "../features/shipping-instruction/shipping-instruction-view-route";
const shippingInstructionViewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/shipping-instruction/$siId",
  component: () => <ShippingInstructionViewRoute />,
});

// 3.11 VGM
import { VgmDashboardRoute } from "../features/vgm/vgm-dashboard-route";
const vgmDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/vgm",
  component: () => <VgmDashboardRoute />,
});

function assertBLAccess() {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw redirect({ to: "/", search: { login: true } as any });
  }
  const allowed =
    user.role === "ADMIN" ||
    user.isSessionAdmin ||
    user.capabilities.includes("BL");
  if (!allowed) {
    throw redirect({ to: "/app/dashboard" });
  }
}

import { BillOfLadingBatchPrintRoute } from "../features/bill-of-lading/bill-of-lading-batch-print-route";
import { BillOfLadingDashboardRoute } from "../features/bill-of-lading/bill-of-lading-dashboard-route";
import {
  BillOfLadingMcnListRoute,
  BillOfLadingMcnViewRoute,
} from "../features/bill-of-lading/bill-of-lading-mcn-route";
import { BillOfLadingViewRoute } from "../features/bill-of-lading/bill-of-lading-view-route";
import { BillOfLadingWizardRoute } from "../features/bill-of-lading/bill-of-lading-wizard-route";

const blDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl",
  beforeLoad: assertBLAccess,
  component: () => <BillOfLadingDashboardRoute />,
});

const blViewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/$blNo",
  beforeLoad: assertBLAccess,
  component: () => <BillOfLadingViewRoute />,
});

const blWizardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/$blNo/edit",
  beforeLoad: assertBLAccess,
  component: () => <BillOfLadingWizardRoute />,
});

const blBatchPrintRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/batch-print",
  beforeLoad: assertBLAccess,
  component: () => <BillOfLadingBatchPrintRoute />,
});

const blMcnListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/mcn",
  beforeLoad: assertBLAccess,
  component: () => <BillOfLadingMcnListRoute />,
});

const blMcnViewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/bl/mcn/$mcnId",
  beforeLoad: assertBLAccess,
  component: () => <BillOfLadingMcnViewRoute />,
});

// 4. Route Tree
const routeTree = rootRoute.addChildren([
  publicRoute.addChildren([
    indexRoute,
    registerRoute,
    activationRoute,
    contactUsRoute,
  ]),
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
    blWizardRoute,
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

// 5. Create Router
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const router = createRouter({ routeTree } as any);

// Register your router for maximum type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
