// Created by Sekar Nagarajan (2026-08-28 00:55)
import type { BLParty, BLDTO } from "../types/bl.types";
import {
  cardsToSiPartiesForm,
  type SiPartyCardData,
  type SiPartyRoleKey,
} from "../../shipping-instruction/utils/si-party.utils";

const EMPTY_PARTY: BLParty = {
  name: "",
  address: "",
  city: "",
  country: "",
  printOnBl: true,
};

function cardToParty(
  card: SiPartyCardData | undefined,
  existing?: BLParty,
): BLParty {
  if (!card) {
    return { ...EMPTY_PARTY };
  }
  return {
    ...(existing ?? EMPTY_PARTY),
    name: card.company,
    address: card.address,
    city: card.city,
    country: card.country,
    printOnBl: card.printOnBl,
  };
}

export function cardsToBlParties(
  cards: Partial<Record<SiPartyRoleKey, SiPartyCardData>>,
  existing: BLDTO["parties"],
): BLDTO["parties"] {
  return {
    shipper: cardToParty(cards.shipper, existing.shipper),
    consignee: {
      ...cardToParty(cards.consignee, existing.consignee),
      toOrder: cards.consignee?.toOrder ?? false,
    },
    notify: cardToParty(cards.notify, existing.notify),
    notify2: cards.notify2
      ? cardToParty(cards.notify2, existing.notify2)
      : undefined,
    notify3: cards.notify3
      ? cardToParty(cards.notify3, existing.notify3)
      : undefined,
    forwarder: existing.forwarder,
    warehouse: existing.warehouse,
    notifySameAsConsignee: existing.notifySameAsConsignee,
  };
}

export { cardsToSiPartiesForm };
