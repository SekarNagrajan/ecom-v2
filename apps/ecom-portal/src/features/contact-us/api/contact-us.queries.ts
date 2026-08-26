// Modified by Sekar Nagarajan (2026-08-25 16:25)
import { useQuery } from "@tanstack/react-query";

import { fetchCountries, fetchStates } from "./contact-us.api";
import { contactUsKeys } from "./contact-us.keys";

export function useContactUsCountries() {
  return useQuery({
    queryKey: contactUsKeys.countries(),
    queryFn: fetchCountries,
    staleTime: Infinity,
  });
}

export function useContactUsStates(countryCode: string) {
  return useQuery({
    queryKey: contactUsKeys.states(countryCode),
    queryFn: () => fetchStates(countryCode),
    enabled: Boolean(countryCode),
  });
}
