// Modified by Sekar Nagarajan (2026-08-25 16:15)
import { useQuery } from "@tanstack/react-query";

import { checkCustomerCode, checkEmail, searchAddress } from "./registration.api";
import { registrationKeys } from "./registration.keys";

/** Address typeahead — enable only when the query has content. */
export function useAddressLookup(query: string) {
  return useQuery({
    queryKey: registrationKeys.addressLookup(query),
    queryFn: () => searchAddress(query),
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

/** Customer code validation — call on blur with an explicit code. */
export function useCustomerCodeCheck(code: string, enabled: boolean) {
  return useQuery({
    queryKey: registrationKeys.customerCode(code),
    queryFn: () => checkCustomerCode(code),
    enabled: enabled && code.trim().length > 0,
    staleTime: 60 * 1000,
    retry: false,
  });
}

/** Email availability — call on blur with an explicit email. */
export function useEmailAvailability(email: string, enabled: boolean) {
  return useQuery({
    queryKey: registrationKeys.email(email),
    queryFn: () => checkEmail(email),
    enabled: enabled && email.trim().length > 0,
    staleTime: 60 * 1000,
    retry: false,
  });
}
