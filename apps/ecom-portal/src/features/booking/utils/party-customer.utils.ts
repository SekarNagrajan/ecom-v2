import type { BookingCustomerOption } from "../api/booking.api";
import type { PartyCardData } from "./party-role.utils";

function newTempCustomerCode(): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Date.now().toString(36).toUpperCase();
  return `NEW-${suffix}`;
}

/** Map a filled party form to a search-compatible customer option. */
export function partyCardToCustomerOption(card: PartyCardData): BookingCustomerOption {
  const code = card.contact.trim() || newTempCustomerCode();
  return {
    customerName: card.company.trim(),
    customerCode: code,
    systemCode: "NEW",
    city: card.city.trim(),
    country: card.country.trim(),
    email: card.email.trim() || undefined,
    phone: card.phone.trim() || undefined,
    address: card.address.trim() || undefined,
  };
}

/** Build a party card from search selection, preferring a pending create card. */
export function customerOptionToPartyCard(
  customer: BookingCustomerOption,
  pending?: PartyCardData | null,
): PartyCardData {
  if (pending) {
    return {
      ...pending,
      company: pending.company.trim() || customer.customerName,
      contact: pending.contact.trim() || customer.customerCode,
    };
  }
  const location = [customer.city, customer.country].filter(Boolean).join(", ");
  return {
    company: customer.customerName,
    contact: customer.customerCode,
    address: customer.address?.trim() || location,
    city: customer.city,
    country: customer.country,
    email: customer.email || "",
    phone: customer.phone || "",
  };
}

export function filterSessionCustomers(
  session: BookingCustomerOption[],
  query: string,
): BookingCustomerOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return session.filter((c) => {
    const haystack = [
      c.customerName,
      c.customerCode,
      c.systemCode,
      c.city,
      c.country,
      c.address ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function mergeCustomerOptions(
  apiResults: BookingCustomerOption[],
  sessionMatches: BookingCustomerOption[],
): BookingCustomerOption[] {
  const seen = new Set(apiResults.map((c) => c.customerCode));
  return [...apiResults, ...sessionMatches.filter((c) => !seen.has(c.customerCode))];
}
