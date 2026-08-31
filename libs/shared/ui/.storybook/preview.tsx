import "../src/styles.css"; // Ensure your tailwind/global styles are imported

import type { Preview } from "@storybook/react";
import { theme } from "antd";
import React from "react";

import { AppConfigProvider } from "../src/providers/app-config-provider";
import { DEFAULT_APP_CONFIG } from "../src/providers/defaults";

// 1. List of RTL Locale Keys
const rtlLocales = ["ar-EG", "he-IL", "fa-IR"];

const activeLocales = [
  "en-US",
  "en-GB", // English
  "fr-FR",
  "de-DE", // Europe
  "zh-CN",
  "ja-JP", // Asia
  "ar-EG", // RTL (Critical for testing layout)
  "es-ES",
  "pt-BR", // LATAM/Spain
  "ta-IN",
];

// Helper to make the dropdown visually scannable
function getFlagEmoji(locale: string) {
  const flags: Record<string, string> = {
    "en-US": "🇺🇸",
    "en-GB": "🇬🇧",
    "fr-FR": "🇫🇷",
    "de-DE": "🇩🇪",
    "zh-CN": "🇨🇳",
    "ja-JP": "🇯🇵",
    "ar-EG": "🇪🇬",
    "es-ES": "🇪🇸",
    "pt-BR": "🇧🇷",
  };
  return flags[locale] || "";
}

const localeToolbarOptions = activeLocales.map((key) => ({
  value: key,
  title: key,
  right: getFlagEmoji(key),
}));

// 2. Helper Layout to visualize the applied theme background/text
const ThemedLayout = ({ children }: { children: React.ReactNode }) => {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        color: token.colorText,
        fontFamily: token.fontFamily,
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        transition: "all 0.3s ease",
        minHeight: "100vh", // Ensure full height for theme checks
        padding: "2rem",
      }}
    >
      {children}
    </div>
  );
};

const preview: Preview = {
  globalTypes: {
    // --- VISUAL: THEME & COLOR ---
    themeMode: {
      name: "Theme",
      description: "Global Theme Mode",
      defaultValue: "light",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light Mode" },
          { value: "dark", title: "Dark Mode" },
          { value: "auto", title: "Auto (System)" },
        ],
      },
    },
    primaryColor: {
      name: "Primary",
      description: "Primary Brand Color",
      defaultValue: "#1677ff",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "#1677ff", title: "Blue (Default)" },
          { value: "#722ed1", title: "Purple" },
          { value: "#047857", title: "Green" },
          { value: "#f5222d", title: "Red" },
        ],
      },
    },
    secondaryColor: {
      name: "Secondary",
      description: "Secondary Custom Color",
      defaultValue: "#722ed1",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "#722ed1", title: "Purple (Default)" },
          { value: "#fa8c16", title: "Orange" },
          { value: "#13c2c2", title: "Cyan" },
        ],
      },
    },

    // --- VISUAL: DENSITY & TYPOGRAPHY ---
    density: {
      name: "Density",
      description: "Component Density (Compact, Normal, Comfortable)",
      defaultValue: "normal",
      toolbar: {
        icon: "collapse",
        items: [
          { value: "compact", title: "Compact (Small)" },
          { value: "normal", title: "Normal (Middle)" },
          { value: "comfortable", title: "Comfortable (Large)" },
        ],
      },
    },
    baseFontSize: {
      name: "Font Size",
      description: "Base Font Size (px)",
      defaultValue: "14",
      toolbar: {
        icon: "document",
        items: [
          { value: "12", title: "12px (Small)" },
          { value: "14", title: "14px (Standard)" },
          { value: "16", title: "16px (Large)" },
        ],
      },
    },
    lineHeight: {
      name: "Line Height",
      description: "Line Height Level",
      defaultValue: "normal",
      toolbar: {
        icon: "menu",
        items: [
          { value: "tight", title: "Tight" },
          { value: "normal", title: "Normal" },
          { value: "relaxed", title: "Relaxed" },
        ],
      },
    },
    fontFamily: {
      name: "Font",
      description: "Global Font Family",
      defaultValue:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      toolbar: {
        icon: "bookmark",
        items: [
          {
            value:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
            title: "System (Default)",
          },
          { value: "'Inter', sans-serif", title: "Inter" },
          { value: "'Georgia', serif", title: "Serif" },
        ],
      },
    },

    // --- LOGIC: LOCALIZATION ---
    // 1. AntD Locale (UI Language: "Submit", "Calendar")
    locale: {
      name: "UI Locale",
      description: "Ant Design Component Language",
      defaultValue: "en_US",
      toolbar: {
        icon: "globe",
        items: localeToolbarOptions,
      },
    },
    // 2. Formatting Region (Intl: Numbers, Dates)
    formattingRegion: {
      name: "Format Region",
      description: "Region for Numbers/Dates (Intl)",
      defaultValue: "en-US",
      toolbar: {
        icon: "form",
        items: [
          { value: "en-US", title: "US (1,000.00)" },
          { value: "de-DE", title: "Germany (1.000,00)" },
          { value: "fr-FR", title: "France (1 000,00)" },
          { value: "ta-IN", title: "India (1,00,000)" },
          { value: "zh-CN", title: "China (100,000)" },
        ],
      },
    },

    // --- LOGIC: DATE & CURRENCY ---
    currency: {
      name: "Currency",
      defaultValue: "USD",
      toolbar: {
        icon: "apple",
        items: [
          { value: "USD", title: "USD ($)" },
          { value: "EUR", title: "EUR (€)" },
          { value: "GBP", title: "GBP (£)" },
          { value: "JPY", title: "JPY (¥)" },
          { value: "INR", title: "INR (₹)" },
        ],
      },
    },
    timezone: {
      name: "Timezone",
      defaultValue: "UTC",
      toolbar: {
        icon: "time",
        items: [
          { value: "UTC", title: "UTC" },
          { value: "America/New_York", title: "New York" },
          { value: "Asia/Kolkata", title: "Kolkata" },
          { value: "Asia/Tokyo", title: "Tokyo" },
        ],
      },
    },
    currencyDisplay: {
      name: "Currency Display",
      defaultValue: "symbol",
      toolbar: {
        icon: "bitbucket",
        items: [
          { value: "symbol", title: "Symbol" },
          { value: "code", title: "Code" },
          { value: "name", title: "Name" },
        ],
      },
    },
  },

  decorators: [
    (Story, context) => {
      // 1. Extract all global inputs
      const {
        themeMode,
        primaryColor,
        secondaryColor,
        density,
        baseFontSize,
        lineHeight,
        fontFamily,
        locale, // The Key (e.g., 'en_US')
        formattingRegion,
        currency,
        timezone,
        dateFormat,
        timeFormat,
        currencyDisplay,
      } = context.globals;

      // 3. Logic: Resolve Direction (RTL/LTR)
      const currentDirection = rtlLocales.includes(locale) ? "rtl" : "ltr";

      // 4. Build config object from toolbar globals
      const storybookConfig = {
        ...DEFAULT_APP_CONFIG,
        themeMode,
        density,
        baseFontSize: Number(baseFontSize) || DEFAULT_APP_CONFIG.baseFontSize,
        lineHeight,
        primaryColor,
        secondaryColor,
        fontFamily,
        timezone,
        dateFormat: dateFormat || "dd/MM/yyyy",
        timeFormat: timeFormat || "HH:mm",
        locale,
        formattingRegion,
        currency,
        currencyDisplay,
      };

      return (
        <AppConfigProvider
          config={storybookConfig}
          direction={currentDirection}
        >
          <ThemedLayout>
            <Story />
          </ThemedLayout>
        </AppConfigProvider>
      );
    },
  ],
};

export default preview;
