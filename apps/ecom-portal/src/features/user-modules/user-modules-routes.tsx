// Modified by Sekar Nagarajan (2026-08-26 16:00)
import { Card } from "antd";
import type { ReactNode } from "react";

import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ChangePasswordView } from "./components/ChangePasswordView";
import { MyAlertsView } from "./components/MyAlertsView";
import { PaymentHistoryView } from "./components/PaymentHistoryView";
import { ProfileView } from "./components/ProfileView";
import { QuotesView } from "./components/QuotesView";
import { UserModulesModuleStyles } from "./components/user-modules-module-styles";

function UserModulesPageShell({ children }: { children: ReactNode }) {
  return (
    <FeaturePageShell>
      <UserModulesModuleStyles />
      <Card className="feature-page-card um-page-card" bordered={false}>
        {children}
      </Card>
    </FeaturePageShell>
  );
}

export function ProfileRoute() {
  return (
    <UserModulesPageShell>
      <ProfileView />
    </UserModulesPageShell>
  );
}

export function ChangePasswordRoute() {
  return (
    <UserModulesPageShell>
      <ChangePasswordView />
    </UserModulesPageShell>
  );
}

export function QuotesRoute() {
  return (
    <UserModulesPageShell>
      <QuotesView />
    </UserModulesPageShell>
  );
}

export function MyAlertsRoute() {
  return (
    <UserModulesPageShell>
      <MyAlertsView />
    </UserModulesPageShell>
  );
}

export function PaymentHistoryRoute() {
  return (
    <UserModulesPageShell>
      <PaymentHistoryView />
    </UserModulesPageShell>
  );
}
