// Modified by Sekar Nagarajan (2026-08-26 16:00)
export const userModulesKeys = {
  all: ["user-modules"] as const,
  profile: () => [...userModulesKeys.all, "profile"] as const,
  alertsPrefs: () => [...userModulesKeys.all, "alerts", "prefs"] as const,
  alertsLogs: () => [...userModulesKeys.all, "alerts", "logs"] as const,
  quotes: () => [...userModulesKeys.all, "quotes"] as const,
  payments: () => [...userModulesKeys.all, "payments"] as const,
};
