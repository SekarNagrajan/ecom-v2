// Modified by Antigravity (2026-08-21)
import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@solverminds/auth';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { RegistrationRoute } from '../features/registration/registration-route';
import { ActivationRoute } from '../features/auth/activation-route';
import { ContactUsRoute } from '../features/contact-us/contact-us-route';
import { SchedulesRoute } from '../features/schedules/schedules-route';
import { AdminRoute } from '../features/admin/admin-route';
import { userCreationRoute } from '../features/user-creation/user-creation-route';
import { vendorApprovalsRoute } from '../features/vendor-approvals/vendor-approvals-route';
import { ProfileView } from '../features/user-modules/components/ProfileView';
import { ChangePasswordView } from '../features/user-modules/components/ChangePasswordView';
import { QuotesView } from '../features/user-modules/components/QuotesView';
import { MyAlertsView } from '../features/user-modules/components/MyAlertsView';
import { PaymentHistoryView } from '../features/user-modules/components/PaymentHistoryView';

// 1. Root Route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// 2. Public Layout Route
const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  component: () => <PublicLayout />,
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/app/dashboard' });
    }
  },
});

// 2.1 Landing Page
const indexRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>) => ({
    login: search.login as boolean | undefined,
  }),
  component: () => null,
});

// 2.2 Registration
const registerRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: '/register',
  component: () => <RegistrationRoute onCancel={() => window.history.back()} />,
});

// 2.3 Activation
const activationRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: '/activation',
  component: () => <ActivationRoute onProceedToLogin={() => window.history.back()} />,
});

// 2.4 Contact Us
const contactUsRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: '/contact-us',
  validateSearch: (search: Record<string, unknown>) => ({
    fromRegistration: search.fromRegistration as string | undefined,
  }),
  component: () => <ContactUsRoute />,
});

// 3. Authenticated Layout Route
export const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: () => <AuthenticatedLayout />,
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/', search: { login: true } as any });
    }
  },
});

// 3.1 Dashboard
import { EnhancedDashboardView } from '../features/dashboard/components/EnhancedDashboardView';

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/dashboard',
  component: EnhancedDashboardView,
});


// 3.2 Schedules
const schedulesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/schedules',
  component: () => <SchedulesRoute />,
});

// 3.3 System Admin Control Panel
const adminRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/admin',
  component: () => <AdminRoute />,
});

// 3.4 User Profile
const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/profile',
  component: () => <ProfileView />,
});

// 3.5 Change Password
const changePasswordRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/change-password',
  component: () => <ChangePasswordView />,
});

// 3.6 Quote / Rate Requests
const quotesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/quotes',
  component: () => <QuotesView />,
});

// 3.7 My Alert Preferences
const myAlertsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/my-alerts',
  component: () => <MyAlertsView />,
});

// 3.8 Payment History
const paymentsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/payments',
  component: () => <PaymentHistoryView />,
});

import { TrackingRoute } from '../features/tracking/tracking-route';

// 3.9 Cargo & Container Tracking
const trackingRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/tracking',
  component: () => <TrackingRoute />,
});

// 4. Route Tree
const routeTree = rootRoute.addChildren([
  publicRoute.addChildren([indexRoute, registerRoute, activationRoute, contactUsRoute]),
  appRoute.addChildren([
    dashboardRoute,
    schedulesRoute,
    trackingRoute,
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
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
