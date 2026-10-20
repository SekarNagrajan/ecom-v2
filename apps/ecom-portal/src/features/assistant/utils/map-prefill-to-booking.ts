// Modified by Sekar Nagarajan (2026-10-20 13:05)
import dayjs from "dayjs";

import type { MasterDetailsData } from "../../booking/types/booking.types";

/**
 * Build MasterDetails from assistant prefill arguments.
 * Same defaults as schedule mapper, with selectedRoute: null.
 */
export function mapPrefillToMasterDetails(
  args: Record<string, unknown>,
): MasterDetailsData {
  const master =
    args.master_details && typeof args.master_details === "object"
      ? (args.master_details as Record<string, unknown>)
      : args;

  const origin =
    typeof master.origin === "string"
      ? master.origin
      : typeof master.pol === "string"
        ? master.pol
        : "";
  const delivery =
    typeof master.delivery === "string"
      ? master.delivery
      : typeof master.pod === "string"
        ? master.pod
        : typeof master.destination === "string"
          ? master.destination
          : "";

  let cargoReadyDate =
    typeof master.cargoReadyDate === "string"
      ? master.cargoReadyDate
      : typeof master.cargo_ready_date === "string"
        ? master.cargo_ready_date
        : typeof master.etd === "string"
          ? master.etd
          : "";

  const parsed = dayjs(cargoReadyDate);
  cargoReadyDate = parsed.isValid()
    ? parsed.format("YYYY-MM-DD")
    : dayjs().format("YYYY-MM-DD");

  return {
    origin,
    delivery,
    cargoReadyDate,
    haulageOriginType: "Merchant",
    haulageDestinationType: "Merchant",
    carriageContract: "",
    onlineBookingNo: "",
    agreementParty: "",
    preferredAgency: "",
    additionalInformation: "",
    selectedRoute: null,
    selectedRate: null,
  };
}
