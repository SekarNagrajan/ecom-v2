// Modified by Sekar Nagarajan (2026-08-25 16:25)

export const contactUsKeys = {
  all: ["contact-us"] as const,
  countries: () => [...contactUsKeys.all, "countries"] as const,
  states: (countryCode: string) =>
    [...contactUsKeys.all, "states", countryCode] as const,
};
