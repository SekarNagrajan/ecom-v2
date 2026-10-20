// Modified by Sekar Nagarajan (2026-09-29 12:40)
import { useNavigate } from "@tanstack/react-router";
import { Segmented, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { LoginEntryType } from "../types/auth.types";

const { Text } = Typography;

interface LoginEntrySwitcherProps {
  activeEntry: LoginEntryType;
}

/** Segmented control that navigates between /cpanel, /eadmin, and /admin. */
export function LoginEntrySwitcher({ activeEntry }: LoginEntrySwitcherProps) {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const entryOptions = useMemo(
    () =>
      [
        {
          label: t("entrySwitcher.cpanel"),
          value: "cpanel" as const,
          path: "/cpanel" as const,
        },
        {
          label: t("entrySwitcher.eadmin"),
          value: "eadmin" as const,
          path: "/eadmin" as const,
        },
        {
          label: t("entrySwitcher.admin"),
          value: "admin" as const,
          path: "/admin" as const,
        },
      ] as const,
    [t],
  );

  return (
    <div className="admin-login-page__switcher">
      <Text className="admin-login-page__switcher-label">
        {t("entrySwitcher.label")}
      </Text>
      <Segmented
        block
        value={activeEntry}
        options={entryOptions.map((o) => ({
          label: o.label,
          value: o.value,
        }))}
        onChange={(value) => {
          const next = entryOptions.find((o) => o.value === value);
          if (next && next.value !== activeEntry) {
            navigate({ to: next.path });
          }
        }}
      />
    </div>
  );
}
