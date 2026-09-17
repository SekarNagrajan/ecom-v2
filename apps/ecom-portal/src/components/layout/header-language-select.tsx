// Created by Sekar Nagarajan (2026-09-17 11:56)
import { AppButton } from "@solverminds/shared-ui";
import type { MenuProps } from "antd";
import { Dropdown } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../icons";

export type PortalLanguageCode = "en" | "zh" | "ma" | "es";

const PORTAL_LANGUAGE_STORAGE_KEY = "ecom-portal-language";

const PORTAL_LANGUAGES: Array<{
  key: PortalLanguageCode;
  label: string;
  nativeName: string;
  detail: string;
  shortCode: string;
}> = [
  {
    key: "en",
    label: "English",
    nativeName: "English",
    detail: "Default portal language",
    shortCode: "EN",
  },
  {
    key: "zh",
    label: "Chinese",
    nativeName: "中文",
    detail: "Simplified Chinese (中文)",
    shortCode: "ZH",
  },
  {
    key: "ma",
    label: "Malay",
    nativeName: "Bahasa Melayu",
    detail: "Bahasa Melayu",
    shortCode: "MS",
  },
  {
    key: "es",
    label: "Spanish",
    nativeName: "Español",
    detail: "Español (Spanish)",
    shortCode: "ES",
  },
];

function readStoredLanguage(): PortalLanguageCode {
  if (typeof window === "undefined") {
    return "en";
  }
  try {
    const stored = window.localStorage.getItem(PORTAL_LANGUAGE_STORAGE_KEY);
    if (
      stored === "en" ||
      stored === "zh" ||
      stored === "ma" ||
      stored === "es"
    ) {
      return stored;
    }
  } catch {
    // ignore storage failures
  }
  return "en";
}

interface HeaderLanguageSelectProps {
  /** CSS class for the trigger button — pub vs authenticated header chrome */
  buttonClassName?: string;
  /** When false, hide the full language label (keep code + globe) */
  showLabel?: boolean;
}

/**
 * Shared header language dropdown for PublicLayoutHeader and
 * AuthenticatedLayoutHeader (guest + logged-in). Selection persists in
 * localStorage so the choice survives login.
 */
export function HeaderLanguageSelect({
  buttonClassName = "app-header-action",
  showLabel = true,
}: HeaderLanguageSelectProps) {
  const [language, setLanguage] =
    useState<PortalLanguageCode>(readStoredLanguage);
  const selectedLanguage =
    PORTAL_LANGUAGES.find((item) => item.key === language) ??
    PORTAL_LANGUAGES[0];

  const languageItems: MenuProps["items"] = PORTAL_LANGUAGES.map((item) => ({
    key: item.key,
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
    const next = key as PortalLanguageCode;
    setLanguage(next);
    try {
      window.localStorage.setItem(PORTAL_LANGUAGE_STORAGE_KEY, next);
    } catch {
      // ignore storage failures
    }
  };

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{
        items: languageItems,
        selectable: true,
        selectedKeys: [language],
        onClick: onLanguageClick,
      }}
    >
      <AppButton
        type="text"
        className={buttonClassName}
        aria-label={`Language: ${selectedLanguage.label}`}
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
