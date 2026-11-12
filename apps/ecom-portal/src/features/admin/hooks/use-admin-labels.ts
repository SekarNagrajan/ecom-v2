// Created by Sekar Nagarajan (2026-11-12 12:40)
import { useTranslation } from "react-i18next";

import {
  type AdminCategoryKey,
  type AdminSectionKey,
} from "../utils/admin-menu-access";
import {
  categoryLabel,
  sectionSubtitle,
  sectionTitle,
  type AdminLabelTranslator,
} from "../utils/admin-section-nav";

/**
 * Translated Control Panel copy from the `admin` namespace, with the English registry values as
 * defaults — so the sidebar, tab strip and section headers can never drift apart.
 */
export function useAdminLabels() {
  const { t } = useTranslation("admin");
  const translate: AdminLabelTranslator = (key, options) => t(key, options);

  return {
    translate,
    moduleTitle: translate("title", { defaultValue: "Control Panel" }),
    moduleSubtitle: translate("subtitle", {
      defaultValue:
        "Manage access, platform settings, communications and service rules.",
    }),
    tabsLabel: translate("tabsLabel", { defaultValue: "Control Panel sections" }),
    loadErrorTitle: translate("states.loadErrorTitle", {
      defaultValue: "Couldn't load this section",
    }),
    retryLabel: translate("states.retry", { defaultValue: "Try again" }),
    sectionTitle: (key: AdminSectionKey) => sectionTitle(key, translate),
    sectionSubtitle: (key: AdminSectionKey) => sectionSubtitle(key, translate),
    categoryLabel: (key: AdminCategoryKey) => categoryLabel(key, translate),
  };
}
