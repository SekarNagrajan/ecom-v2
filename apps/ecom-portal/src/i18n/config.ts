// Created by Sekar Nagarajan — portal-wide i18next configuration.
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

/** Languages the portal ships translations for. English is the fallback. */
export const SUPPORTED_LANGUAGES = ["en", "zh", "ms", "es"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Default / fallback language. */
export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

/**
 * localStorage key that persists the user's language choice. Kept identical to
 * the legacy key used by the header dropdown so existing preferences survive.
 */
export const LANGUAGE_STORAGE_KEY = "ecom-portal-language";

/**
 * Maps our short i18n codes to the region-qualified locale codes that Ant
 * Design's `ConfigProvider` (and Luxon/Intl formatting) expect. Consumed by the
 * language selector to keep antd component chrome (date pickers, pagination,
 * empty states) in sync with the active language.
 */
export const LANG_TO_ANTD_LOCALE: Record<SupportedLanguage, string> = {
  en: "en-US",
  zh: "zh-CN",
  ms: "ms-MY",
  es: "es-ES",
};

/** Human-readable metadata for each language — used by the selector dropdown. */
export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
  detail: string;
  shortCode: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: "en",
    label: "English",
    nativeName: "English",
    detail: "Default portal language",
    shortCode: "EN",
  },
  {
    code: "zh",
    label: "Chinese",
    nativeName: "中文",
    detail: "Simplified Chinese (中文)",
    shortCode: "ZH",
  },
  {
    code: "ms",
    label: "Malay",
    nativeName: "Bahasa Melayu",
    detail: "Bahasa Melayu",
    shortCode: "MS",
  },
  {
    code: "es",
    label: "Spanish",
    nativeName: "Español",
    detail: "Español (Spanish)",
    shortCode: "ES",
  },
];

/**
 * Eagerly bundle every translation file matching `src/locales/<lng>/<ns>.json`.
 * New feature namespaces are picked up automatically — no manual import wiring.
 */
const localeModules = import.meta.glob("../locales/*/*.json", {
  eager: true,
}) as Record<string, { default: Record<string, unknown> }>;

type Resources = Record<string, Record<string, Record<string, unknown>>>;

const resources: Resources = {};
for (const [path, mod] of Object.entries(localeModules)) {
  const match = /\/locales\/([^/]+)\/([^/]+)\.json$/.exec(path);
  if (!match) continue;
  const [, lng, ns] = match;
  (resources[lng] ??= {})[ns] = mod.default;
}

/** Namespaces derived from the English (source-of-truth) resource set. */
const namespaces = Object.keys(resources[DEFAULT_LANGUAGE] ?? { common: {} });

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    // Treat "zh-CN"/"en-US" from the browser as "zh"/"en".
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    ns: namespaces,
    defaultNS: "common",
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
    // Missing keys fall back to English rather than rendering `null`.
    returnNull: false,
    returnEmptyString: false,
    interpolation: {
      // React already escapes values, so i18next must not double-escape.
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
