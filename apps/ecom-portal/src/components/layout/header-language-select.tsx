// Created by Sekar Nagarajan (2026-09-17 11:56)
// Reworked to drive react-i18next + antd ConfigProvider locale.
import { AppButton } from "@solverminds/shared-ui";
import type { MenuProps } from "antd";
import { Dropdown } from "antd";
import { useTranslation } from "react-i18next";

import {
  LANGUAGE_OPTIONS,
  LANG_TO_ANTD_LOCALE,
  type SupportedLanguage,
} from "../../i18n/config";
import { useAppConfigStore } from "../../features/theme/stores/app-config.store";
import { AppIcon, Icons } from "../icons";

/** Public alias kept for backwards compatibility with existing imports. */
export type PortalLanguageCode = SupportedLanguage;

interface HeaderLanguageSelectProps {
  /** CSS class for the trigger button — pub vs authenticated header chrome */
  buttonClassName?: string;
  /** When false, hide the full language label (keep code + globe) */
  showLabel?: boolean;
}

/**
 * Shared header language dropdown for PublicLayoutHeader and
 * AuthenticatedLayoutHeader (guest + logged-in). Selecting a language calls
 * `i18n.changeLanguage` (which re-renders every `t()` consumer instantly and
 * persists to localStorage via the language detector) and syncs the antd
 * ConfigProvider locale so date pickers / pagination / empty states localize
 * too. The choice survives refresh and login.
 */
export function HeaderLanguageSelect({
  buttonClassName = "app-header-action",
  showLabel = true,
}: HeaderLanguageSelectProps) {
  const { i18n, t } = useTranslation("common");
  const setConfig = useAppConfigStore((state) => state.setConfig);
  const config = useAppConfigStore((state) => state.config);

  const activeCode = (i18n.resolvedLanguage ??
    i18n.language ??
    "en") as SupportedLanguage;
  const selectedLanguage =
    LANGUAGE_OPTIONS.find((item) => item.code === activeCode) ??
    LANGUAGE_OPTIONS[0];

  const languageItems: MenuProps["items"] = LANGUAGE_OPTIONS.map((item) => ({
    key: item.code,
    label: (
      <div className="pub-header-lang-item">
        <span className="pub-header-lang-item__name">
          {item.nativeName}
          {item.nativeName !== item.label ? ` · ${item.label}` : ""}
        </span>
        <span className="pub-header-lang-item__detail">{item.detail}</span>
      </div>
    ),
  }));

  const onLanguageClick: MenuProps["onClick"] = ({ key }) => {
    const next = key as SupportedLanguage;
    void i18n.changeLanguage(next);
    // Keep antd component chrome (via AppConfigProvider) aligned with the UI language.
    const nextLocale = LANG_TO_ANTD_LOCALE[next];
    if (config.locale !== nextLocale) {
      setConfig({ ...config, locale: nextLocale });
    }
  };

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{
        items: languageItems,
        selectable: true,
        selectedKeys: [selectedLanguage.code],
        onClick: onLanguageClick,
      }}
    >
      <AppButton
        type="text"
        className={buttonClassName}
        aria-label={t("languageAria", { language: selectedLanguage.label })}
        aria-haspopup="menu"
      >
        <span className="pub-header-lang-trigger">
          <AppIcon icon={Icons.globe} size={16} />
          <span className="pub-header-lang-trigger__code">
            {selectedLanguage.shortCode}
          </span>
          {showLabel ? (
            <span className="pub-header-action__label app-header-action__label">
              {selectedLanguage.label}
            </span>
          ) : null}
          <AppIcon icon={Icons.chevronDown} size={14} />
        </span>
      </AppButton>
    </Dropdown>
  );
}
