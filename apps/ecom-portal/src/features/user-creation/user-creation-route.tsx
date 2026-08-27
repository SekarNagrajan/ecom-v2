// Modified by Sekar Nagarajan (2026-08-27 11:50)
import { useAuthStore } from "@solverminds/auth";
import { createRoute, redirect } from "@tanstack/react-router";
import { Card } from "antd";

import { appRoute } from "../../app/router";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { UserCreationListing } from "./components/UserCreationListing";
import { UserCreationModuleStyles } from "./components/user-creation-module-styles";

function UserCreationRoute() {
  return (
    <FeaturePageShell>
      <UserCreationModuleStyles />
      <Card className="feature-page-card usc-page-card" bordered={false}>
        <UserCreationListing />
      </Card>
    </FeaturePageShell>
  );
}

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
  component: UserCreationRoute,
});
