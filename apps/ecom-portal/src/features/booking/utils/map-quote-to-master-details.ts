// Created by Sekar Nagarajan (2026-10-20)
import dayjs from "dayjs";

import type { QuoteItem } from "../../user-modules/types/user-modules.types";
import type { MasterDetailsData } from "../types/booking.types";

function portDisplay(code: string, name: string): string {
  const trimmedCode = code.trim();
  const trimmedName = name.trim();
  if (!trimmedCode) return trimmedName;
  if (!trimmedName) return trimmedCode;
  if (trimmedName.startsWith(`${trimmedCode} - `)) return trimmedName;
  return `${trimmedCode} - ${trimmedName}`;
}

function cargoReadyDateFromQuote(quote: QuoteItem): string {
  const fromValid = dayjs(quote.validFrom);
  if (fromValid.isValid()) {
    return fromValid.format("YYYY-MM-DD");
  }
  return dayjs().format("YYYY-MM-DD");
}

/** Map a My Quotes row into booking selectedRate (rate picker shape). */
export function mapQuoteToSelectedRate(quote: QuoteItem) {
  return {
    rateNo: quote.quoteNo,
    itemNo: "1",
    amdNo: "0",
    rateType: "QT",
    eqpType: quote.equipmentType,
    amount: quote.oceanFreightUSD,
    currency: "USD",
    customer: "",
    customerCode: "",
  };
}

/**
 * Prefill booking Master Details from My Quotes "Book This Quote".
 * `selectedRoute` is filled by the caller after fetching sailings for the lane.
 */
export function buildMasterDetailsFromQuote(
  quote: QuoteItem,
): MasterDetailsData {
  return {
    origin: portDisplay(quote.polCode, quote.polName),
    delivery: portDisplay(quote.podCode, quote.podName),
    cargoReadyDate: cargoReadyDateFromQuote(quote),
    haulageOriginType: "Merchant",
    haulageDestinationType: "Merchant",
    carriageContract: "",
    onlineBookingNo: "",
    agreementParty: "",
    preferredAgency: "",
    additionalInformation: "",
    rateReference: quote.quoteNo,
    selectedRoute: null,
    selectedRate: mapQuoteToSelectedRate(quote),
  };
}
