import { useQuery } from '@tanstack/react-query';
import { fetchEquipmentTypes, fetchTabConfig, searchPorts } from './landing.api';
import { landingKeys } from './landing.keys';

/** Port typeahead — debounce query at the call site (min 2 chars). */
export function usePortSearch(query: string) {
  return useQuery({
    queryKey: landingKeys.portSearch(query),
    queryFn: () => searchPorts(query),
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000, // 5 min — port list rarely changes
    placeholderData: (prev) => prev,
  });
}

/** Equipment type dropdown options — fetched once on mount. */
export function useEquipmentTypes() {
  return useQuery({
    queryKey: landingKeys.equipmentTypes(),
    queryFn: fetchEquipmentTypes,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Tab visibility config — determines which of the three hero search tabs
 * are publicly accessible vs. require the login panel to open first.
 * Parity with JSP `menuCategory` "P" = login-required.
 */
export function useTabConfig() {
  return useQuery({
    queryKey: landingKeys.tabConfig(),
    queryFn: fetchTabConfig,
    staleTime: 60 * 60 * 1000,
  });
}
