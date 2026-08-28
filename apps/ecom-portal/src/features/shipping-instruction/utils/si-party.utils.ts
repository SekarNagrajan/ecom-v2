// Modified by Sekar Nagarajan (2026-08-28 00:55)
import type { PartyCardData } from "../../booking/utils/party-role.utils";
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

export const SI_PARTY_ROLE_OPTIONS: { key: SiPartyRoleKey; label: string }[] = [
  { key: "shipper", label: "Shipper" },
  { key: "consignee", label: "Consignee" },
  { key: "notify", label: "Notify Party" },
  { key: "notify2", label: "Notify Party 2" },
  { key: "notify3", label: "Notify Party 3" },
  { key: "forwarder", label: "Forwarder" },
  { key: "warehouse", label: "Warehouse" },
  { key: "agreementParty", label: "Agreement Party" },
];

export const SI_PARTY_ROLE_LABEL: Record<SiPartyRoleKey, string> = {
  shipper: "Shipper",
  consignee: "Consignee",
  notify: "Notify Party",
  notify2: "Notify Party 2",
  notify3: "Notify Party 3",
  forwarder: "Forwarder",
  warehouse: "Warehouse",
  agreementParty: "Agreement Party",
};

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

function cardAddress(card: SiPartyCardData): string {
  return [card.address, card.city, card.country].filter(Boolean).join(", ");
}

export function cardsToSiPartiesForm(
  cards: Partial<Record<SiPartyRoleKey, SiPartyCardData>>,
): SiPartiesForm {
  const shipper = cards.shipper;
  const consignee = cards.consignee;
  const notify = cards.notify;
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
