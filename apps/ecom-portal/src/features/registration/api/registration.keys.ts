// Modified by Sekar Nagarajan (2026-08-25 16:15)
export const registrationKeys = {
  all: ["registration"] as const,
  addressLookup: (query: string) =>
    [...registrationKeys.all, "address", query] as const,
  customerCode: (code: string) =>
    [...registrationKeys.all, "customer-code", code] as const,
  email: (email: string) => [...registrationKeys.all, "email", email] as const,
};
