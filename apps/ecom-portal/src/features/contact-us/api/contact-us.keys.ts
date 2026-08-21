// Modified by Antigravity (2026-08-21)

export const contactUsKeys = {
  all: ['contact-us'] as const,
  countries: () => [...contactUsKeys.all, 'countries'] as const,
  states: (countryCode: string) => [...contactUsKeys.all, 'states', countryCode] as const,
};
