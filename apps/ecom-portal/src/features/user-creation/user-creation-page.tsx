// Created by Sekar Nagarajan (2026-11-12 23:50)
import { Card } from "antd";

import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { UserCreationListing } from "./components/UserCreationListing";
import { UserCreationModuleStyles } from "./components/user-creation-module-styles";

/** Lazy-loaded page body for `/app/user-creation` (route guard lives in user-creation-route.tsx). */
export function UserCreationPage() {
  return (
    <FeaturePageShell>
      <UserCreationModuleStyles />
      <Card className="feature-page-card usc-page-card" bordered={false}>
        <UserCreationListing />
      </Card>
    </FeaturePageShell>
  );
}
