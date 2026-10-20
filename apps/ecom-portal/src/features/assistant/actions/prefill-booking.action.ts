// Modified by Sekar Nagarajan (2026-10-20 13:05)
import { schedulesApi } from "../../schedules/api/schedules.api";
import type { ScheduleItem } from "../../schedules/types/schedules.types";
import { useBookingStore } from "../../booking/stores/booking.store";
import { buildMasterDetailsFromSchedule } from "../../booking/utils/map-schedule-to-master-details";
import { mapPrefillToMasterDetails } from "../utils/map-prefill-to-booking";

export interface PrefillBookingResult {
  ok: boolean;
  reason?: "not_allowed" | "not_found" | "applied";
  schedule?: ScheduleItem;
}

/**
 * Apply booking prefill into the wizard store (does not navigate).
 * Mirrors schedules Book Now: resetWizard + updateMasterDetails.
 */
export async function applyPrefillBooking(
  args: Record<string, unknown>,
): Promise<PrefillBookingResult> {
  const scheduleId =
    typeof args.schedule_id === "string" ? args.schedule_id : null;

  if (scheduleId) {
    const sailings = await schedulesApi.searchSchedules({
      searchType: "POINT_TO_POINT",
    });
    const schedule = sailings.find((s) => s.id === scheduleId);
    if (!schedule) {
      return { ok: false, reason: "not_found" };
    }
    if (!schedule.bookingAllowed) {
      return { ok: false, reason: "not_allowed", schedule };
    }
    const store = useBookingStore.getState();
    store.resetWizard();
    store.updateMasterDetails(buildMasterDetailsFromSchedule(schedule));
    return { ok: true, reason: "applied", schedule };
  }

  const store = useBookingStore.getState();
  store.resetWizard();
  store.updateMasterDetails(mapPrefillToMasterDetails(args));
  return { ok: true, reason: "applied" };
}

export function wizardHasDraftData(): boolean {
  const { payload } = useBookingStore.getState();
  return Boolean(
    payload.masterDetails?.origin ||
      payload.masterDetails?.delivery ||
      payload.masterDetails?.selectedRoute ||
      payload.parties ||
      payload.cargo,
  );
}
