// Modified by Sekar Nagarajan (2026-08-26 15:06)
import { createRoute } from "@tanstack/react-router";
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
  component: UserCreationRoute,
});
