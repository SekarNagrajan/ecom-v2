// Modified by Sekar Nagarajan (2026-10-20 16:50)
/**
 * Automation-mode booking submit AFTER explicit user confirm.
 * Allowed only from AutomationConfirmCard — see assistant-no-submit.guardrail.test.ts.
 */
import { bookingApi } from "../../booking/api/booking.api";
import {
  createEmptyCommodity,
  createEmptyContainer,
  type BookingPayload,
  type PartiesData,
  type SubmitBookingResponse,
} from "../../booking/types/booking.types";
import { useBookingStore } from "../../booking/stores/booking.store";
import { applyPrefillBooking } from "./prefill-booking.action";

export type SubmitBookingActionResult =
  | { ok: true; response: SubmitBookingResponse }
  | { ok: false; reason: string };

function buildMinimalParties(args: Record<string, unknown>): PartiesData {
  const shipper =
    typeof args.shipper_name === "string" && args.shipper_name.trim().length >= 3
      ? args.shipper_name.trim()
      : "Assistant Shipper";
  return {
    shipperName: shipper,
    agreementParty: shipper,
    siSubmittingParty: shipper,
  };
}

function buildMinimalCargo(args: Record<string, unknown>) {
  const containerType =
    typeof args.container_type === "string" && args.container_type.trim()
      ? args.container_type.trim()
      : "20DC";
  const quantity =
    typeof args.quantity === "number" && args.quantity > 0 ? args.quantity : 1;
  const hsCode =
    typeof args.hs_code === "string" && args.hs_code.trim()
      ? args.hs_code.trim()
      : "000000";
  const weight =
    typeof args.weight === "number" && args.weight > 0 ? args.weight : 1000;

  const commodity = createEmptyCommodity();
  commodity.hsCode = hsCode;
  commodity.weight = weight;

  const container = createEmptyContainer(containerType);
  container.quantity = quantity;
  container.commodities = [commodity];

  return { containers: [container] };
}

/**
 * Prefill from args, attach minimal parties/cargo when missing, then submit.
 */
export async function submitBookingAfterConfirm(
  args: Record<string, unknown>,
): Promise<SubmitBookingActionResult> {
  const prefillArgs: Record<string, unknown> = { ...args };
  if (
    !prefillArgs.schedule_id &&
    !prefillArgs.master_details &&
    (prefillArgs.origin || prefillArgs.delivery)
  ) {
    prefillArgs.master_details = {
      origin: prefillArgs.origin,
      delivery: prefillArgs.delivery,
      cargo_ready_date: prefillArgs.cargo_ready_date,
    };
  }

  const prefill = await applyPrefillBooking(prefillArgs);
  if (!prefill.ok) {
    return {
      ok: false,
      reason:
        prefill.reason === "not_allowed" ? "booking_not_allowed" : "prefill_failed",
    };
  }

  const store = useBookingStore.getState();
  const masterDetails = store.payload.masterDetails;
  if (!masterDetails?.origin || !masterDetails.delivery) {
    return { ok: false, reason: "missing_master_details" };
  }

  const parties = store.payload.parties ?? buildMinimalParties(args);
  const cargo = store.payload.cargo ?? buildMinimalCargo(args);

  store.updateParties(parties);
  store.updateCargo(cargo);

  const payload: BookingPayload = {
    masterDetails: store.payload.masterDetails,
    parties: store.payload.parties,
    cargo: store.payload.cargo,
    ens: store.payload.ens ?? null,
    insurance: store.payload.insurance ?? null,
    documents: store.payload.documents ?? [],
    referenceFields: store.payload.referenceFields ?? [],
  };

  try {
    const response = await bookingApi.submitBooking(payload);
    return { ok: true, response };
  } catch (err: unknown) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "submit_failed",
    };
  }
}
