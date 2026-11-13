// Modified by Sekar Nagarajan (2026-09-08 11:01)
export const userModulesKeys = {
  all: ["user-modules"] as const,
  profile: () => [...userModulesKeys.all, "profile"] as const,
  alertsPrefs: () => [...userModulesKeys.all, "alerts", "prefs"] as const,
  alertsLogs: () => [...userModulesKeys.all, "alerts", "logs"] as const,
  quotes: () => [...userModulesKeys.all, "quotes"] as const,
  payments: (fromDate?: string, toDate?: string) =>
    [...userModulesKeys.all, "payments", { fromDate, toDate }] as const,
};
