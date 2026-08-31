// Modified by Sekar Nagarajan (2026-08-31 14:36)
import {
  MOCK_DEFAULT_PARTY_CARDS,
  type PartyCardData,
} from "../../booking/utils/party-role.utils";
import type { SIDTO, SIParty, SiPartiesForm } from "../types/si.types";

export type SiPartyRoleKey =
  | "shipper"
  | "consignee"
  | "notify"
  | "notify2"
  | "notify3"
  | "forwarder"
  | "warehouse"
  | "agreementParty";

export interface SiPartyCardData extends PartyCardData {
  printOnBl: boolean;
  toOrder?: boolean;
}

/**
 * Primary parties always shown on one 3-column row (ecom-app CustomerDetails parity:
 * Booking Party · Agreement Party · Consignee).
 */
export const DEFAULT_SI_PARTY_ROLES: readonly SiPartyRoleKey[] = [
  "shipper",
  "agreementParty",
  "consignee",
] as const;

export const SI_PARTY_ROLE_OPTIONS: { key: SiPartyRoleKey; label: string }[] = [
  { key: "shipper", label: "Booking Party" },
  { key: "consignee", label: "Consignee" },
  { key: "notify", label: "Notify Party" },
  { key: "notify2", label: "Notify Party 2" },
  { key: "notify3", label: "Notify Party 3" },
  { key: "forwarder", label: "Forwarder" },
  { key: "warehouse", label: "Warehouse" },
  { key: "agreementParty", label: "Agreement Party" },
];

export const SI_PARTY_ROLE_LABEL: Record<SiPartyRoleKey, string> = {
  shipper: "Booking Party",
  consignee: "Consignee",
  notify: "Notify Party",
  notify2: "Notify Party 2",
  notify3: "Notify Party 3",
  forwarder: "Forwarder",
  warehouse: "Warehouse",
  agreementParty: "Agreement Party",
};

function toSiCard(card: PartyCardData): SiPartyCardData {
  return {
    ...card,
    printOnBl: true,
  };
}

/** ecom-app mock seed for SI/BL when parties are empty. */
export const MOCK_DEFAULT_SI_PARTY_CARDS: Partial<
  Record<SiPartyRoleKey, SiPartyCardData>
> = {
  shipper: toSiCard(MOCK_DEFAULT_PARTY_CARDS.shipper!),
  agreementParty: toSiCard(MOCK_DEFAULT_PARTY_CARDS.agreementParty!),
  consignee: {
    ...toSiCard(MOCK_DEFAULT_PARTY_CARDS.consignee!),
    toOrder: false,
  },
};

/** CSS modifier for mild per-role card background. */
export function siPartyRoleCardClassName(
  role: SiPartyRoleKey,
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

export function emptySiPartyCard(): SiPartyCardData {
  return {
    company: "",
    contact: "",
    address: "",
    city: "",
    country: "",
    email: "",
    phone: "",
    printOnBl: true,
  };
}

function partyToCard(
  party: SIParty | undefined,
  extras?: Pick<SiPartyCardData, "toOrder">,
): SiPartyCardData | undefined {
  if (!party?.name?.trim()) return undefined;
  return {
    company: party.name,
    contact: "",
    address: party.address || "",
    city: party.city || "",
    country: party.country || "",
    email: "",
    phone: "",
    printOnBl: party.printOnBl ?? true,
    ...extras,
  };
}

type PartyDirectory = {
  shipper?: SIParty;
  consignee?: SIParty & { toOrder?: boolean };
  notify?: SIParty;
  notify2?: SIParty;
  notify3?: SIParty;
  forwarder?: SIParty;
  warehouse?: SIParty;
  agreementParty?: SIParty;
};

export function siPartiesToCards(
  parties: PartyDirectory | SIDTO["parties"] | null | undefined,
): Partial<Record<SiPartyRoleKey, SiPartyCardData>> {
  if (!parties) return {};
  const cards: Partial<Record<SiPartyRoleKey, SiPartyCardData>> = {};
  const shipper = partyToCard(parties.shipper);
  const consignee = partyToCard(parties.consignee, {
    toOrder: parties.consignee?.toOrder,
  });
  const notify = partyToCard(parties.notify);
  const notify2 = partyToCard(parties.notify2);
  const notify3 = partyToCard(parties.notify3);
  const forwarder = partyToCard(parties.forwarder);
  const warehouse = partyToCard(parties.warehouse);
  const agreementParty = partyToCard(parties.agreementParty);
  if (shipper) cards.shipper = shipper;
  if (consignee) cards.consignee = consignee;
  if (notify) cards.notify = notify;
  if (notify2) cards.notify2 = notify2;
  if (notify3) cards.notify3 = notify3;
  if (forwarder) cards.forwarder = forwarder;
  if (warehouse) cards.warehouse = warehouse;
  if (agreementParty) cards.agreementParty = agreementParty;
  return cards;
}

/** Use saved parties when present; otherwise seed ecom-app mock defaults. */
export function initialSiPartyCards(
  parties: PartyDirectory | SIDTO["parties"] | null | undefined,
): Partial<Record<SiPartyRoleKey, SiPartyCardData>> {
  const fromPayload = siPartiesToCards(parties);
  if (Object.keys(fromPayload).length > 0) {
    return fromPayload;
  }
  return structuredClone(MOCK_DEFAULT_SI_PARTY_CARDS);
}

function cardAddress(card: SiPartyCardData): string {
  return [card.address, card.city, card.country].filter(Boolean).join(", ");
}

export function cardsToSiPartiesForm(
  cards: Partial<Record<SiPartyRoleKey, SiPartyCardData>>,
): SiPartiesForm {
  const shipper = cards.shipper;
  const consignee = cards.consignee;
  const notify = cards.notify ?? cards.consignee;
  return {
    shipperName: shipper?.company ?? "",
    shipperAddress: shipper ? cardAddress(shipper) : "",
    shipperPrint: shipper?.printOnBl ?? false,
    consigneeName: consignee?.company ?? "",
    consigneeAddress: consignee ? cardAddress(consignee) : "",
    consigneePrint: consignee?.printOnBl ?? false,
    consigneeToOrder: consignee?.toOrder ?? false,
    notifyName: notify?.company ?? "",
    notifyAddress: notify ? cardAddress(notify) : "",
    notifyPrint: notify?.printOnBl ?? false,
  };
}
