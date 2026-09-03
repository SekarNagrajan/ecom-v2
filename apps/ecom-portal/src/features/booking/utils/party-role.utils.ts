// Modified by Sekar Nagarajan (2026-09-02 18:13)
import type { PartiesData } from "../types/booking.types";

export type PartyRoleKey =
  | "shipper"
  | "consignee"
  | "notifyParty"
  | "notifyParty2"
  | "forwarder"
  | "agreementParty"
  | "siSubmittingParty";

export interface PartyCardData {
  company: string;
  contact: string;
  address: string;
  city: string;
  country: string;
  email: string;
  phone: string;
}

/**
 * Primary parties always shown in the Assigned Parties grid.
 * Booking Party (shipper) is view-only; Agreement Party is editable but not deletable.
 */
export const DEFAULT_PARTY_ROLES: readonly PartyRoleKey[] = [
  "shipper",
  "agreementParty",
] as const;

export const PARTY_ROLE_OPTIONS: { key: PartyRoleKey; label: string }[] = [
  { key: "shipper", label: "Booking Party" },
  { key: "consignee", label: "Consignee" },
  { key: "notifyParty", label: "Notify Party" },
  { key: "notifyParty2", label: "Notify Party 2" },
  { key: "forwarder", label: "Forwarder" },
  { key: "agreementParty", label: "Agreement Party" },
  { key: "siSubmittingParty", label: "SI Submitting Party" },
];

export const PARTY_ROLE_LABEL: Record<PartyRoleKey, string> = {
  shipper: "Booking Party",
  consignee: "Consignee",
  notifyParty: "Notify Party",
  notifyParty2: "Notify Party 2",
  forwarder: "Forwarder",
  agreementParty: "Agreement Party",
  siSubmittingParty: "SI Submitting Party",
};

/** ecom-app CustomerDetailsStep demo seed — used when parties are empty. */
const BOOKING_PARTY_SEED: PartyCardData = {
  company: "Global Shipping Solutions Ltd.",
  contact: "John Smith",
  address: "123 Harbor Street, Singapore 048582",
  city: "Singapore",
  country: "SG",
  email: "john.smith@globalshipping.com",
  phone: "+65 6123 4567",
};

// Modified by Sekar Nagarajan (2026-08-31 22:47)
export const MOCK_DEFAULT_PARTY_CARDS: Partial<
  Record<PartyRoleKey, PartyCardData>
> = {
  shipper: { ...BOOKING_PARTY_SEED },
  agreementParty: { ...BOOKING_PARTY_SEED },
};

/** CSS modifier for mild per-role card background (see booking-module-styles). */
export function partyRoleCardClassName(
  role: PartyRoleKey,
  empty = false,
): string {
  return [
    "booking-party-card",
    `booking-party-card--${role}`,
    empty ? "booking-party-card--empty" : undefined,
  ]
    .filter(Boolean)
    .join(" ");
}

export function emptyPartyCard(): PartyCardData {
  return {
    company: "",
    contact: "",
    address: "",
    city: "",
    country: "",
    email: "",
    phone: "",
  };
}

export function partiesToCards(
  parties: PartiesData | null | undefined,
): Partial<Record<PartyRoleKey, PartyCardData>> {
  if (!parties) return {};
  const cards: Partial<Record<PartyRoleKey, PartyCardData>> = {};
  if (parties.shipperName) {
    cards.shipper = {
      company: parties.shipperName,
      contact: parties.shipperContact || parties.shipperReference || "",
      address: parties.shipperAddress || "",
      city: parties.shipperCity || "",
      country: parties.shipperCountry || "",
      email: parties.shipperEmail || "",
      phone: parties.shipperPhone || "",
    };
  }
  if (parties.consigneeName) {
    cards.consignee = {
      company: parties.consigneeName,
      contact: parties.consigneeContact || "",
      address: parties.consigneeAddress || "",
      city: parties.consigneeCity || "",
      country: parties.consigneeCountry || "",
      email: parties.consigneeEmail || "",
      phone: parties.consigneePhone || "",
    };
  }
  if (parties.notifyPartyName) {
    cards.notifyParty = {
      company: parties.notifyPartyName,
      contact: parties.notifyPartyContact || "",
      address: parties.notifyPartyAddress || "",
      city: parties.notifyPartyCity || "",
      country: parties.notifyPartyCountry || "",
      email: parties.notifyPartyEmail || "",
      phone: parties.notifyPartyPhone || "",
    };
  }
  if (parties.notifyParty2Name) {
    cards.notifyParty2 = {
      company: parties.notifyParty2Name,
      contact: parties.notifyParty2Contact || "",
      address: "",
      city: "",
      country: "",
      email: "",
      phone: "",
    };
  }
  if (parties.freightForwarder) {
    cards.forwarder = {
      company: parties.freightForwarder,
      contact: parties.freightForwarderContact || "",
      address: "",
      city: "",
      country: "",
      email: "",
      phone: "",
    };
  }
  if (parties.agreementParty) {
    cards.agreementParty = {
      company: parties.agreementParty,
      contact: parties.agreementPartyContact || "",
      address: "",
      city: "",
      country: "",
      email: "",
      phone: "",
    };
  }
  if (parties.siSubmittingParty) {
    cards.siSubmittingParty = {
      company: parties.siSubmittingParty,
      contact: parties.siSubmittingPartyContact || "",
      address: "",
      city: "",
      country: "",
      email: "",
      phone: "",
    };
  }
  return cards;
}

// Modified by Sekar Nagarajan (2026-08-31 23:08)
/** Use saved parties when present; otherwise seed ecom-app mock defaults.
 *  Auto-populates agreementParty from shipper when missing. */
export function initialPartyCards(
  parties: PartiesData | null | undefined,
): Partial<Record<PartyRoleKey, PartyCardData>> {
  const fromPayload = partiesToCards(parties);
  if (Object.keys(fromPayload).length > 0) {
    if (!fromPayload.agreementParty && fromPayload.shipper) {
      fromPayload.agreementParty = { ...fromPayload.shipper };
    }
    return fromPayload;
  }
  return structuredClone(MOCK_DEFAULT_PARTY_CARDS);
}

export function cardsToParties(
  cards: Partial<Record<PartyRoleKey, PartyCardData>>,
): PartiesData {
  const shipper = cards.shipper;
  const consignee = cards.consignee;
  const notify = cards.notifyParty;
  const notify2 = cards.notifyParty2;
  const forwarder = cards.forwarder;
  const agreement = cards.agreementParty;
  const si = cards.siSubmittingParty;

  return {
    shipperName: shipper?.company || "",
    shipperReference: "",
    shipperContact: shipper?.contact || "",
    shipperAddress: shipper?.address || "",
    shipperCity: shipper?.city || "",
    shipperCountry: shipper?.country || "",
    shipperEmail: shipper?.email || "",
    shipperPhone: shipper?.phone || "",
    consigneeName: consignee?.company || "",
    consigneeContact: consignee?.contact || "",
    consigneeAddress: consignee?.address || "",
    consigneeCity: consignee?.city || "",
    consigneeCountry: consignee?.country || "",
    consigneeEmail: consignee?.email || "",
    consigneePhone: consignee?.phone || "",
    notifyPartyName: notify?.company || "",
    notifyPartyContact: notify?.contact || "",
    notifyPartyAddress: notify?.address || "",
    notifyPartyCity: notify?.city || "",
    notifyPartyCountry: notify?.country || "",
    notifyPartyEmail: notify?.email || "",
    notifyPartyPhone: notify?.phone || "",
    notifyParty2Name: notify2?.company || "",
    notifyParty2Contact: notify2?.contact || "",
    freightForwarder: forwarder?.company || "",
    freightForwarderContact: forwarder?.contact || "",
    agreementParty: agreement?.company || "",
    agreementPartyContact: agreement?.contact || "",
    // Mock / empty flow: SI Submitting defaults to Booking Party when unset
    siSubmittingParty: si?.company || shipper?.company || "",
    siSubmittingPartyContact: si?.contact || shipper?.contact || "",
  };
}
