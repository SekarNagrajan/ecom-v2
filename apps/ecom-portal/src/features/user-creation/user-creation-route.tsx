// Modified by Sekar Nagarajan (2026-11-12 23:50)
import { useAuthStore } from "@solverminds/auth";
import { createRoute, lazyRouteComponent, redirect } from "@tanstack/react-router";

import { appRoute } from "../../app/router";
import { AppRoutePendingFallback } from "../../components/pending/app-route-pending";

export const userCreationRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "user-creation",
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      throw redirect({ to: "/", search: { login: true } as never });
    }
    if (!user.isSessionAdmin && user.role !== "ADMIN") {
      throw redirect({ to: "/app/dashboard" });
    }
  },
  pendingComponent: () => <AppRoutePendingFallback />,
  component: lazyRouteComponent(() => import("./user-creation-page"), "UserCreationPage"),
});
