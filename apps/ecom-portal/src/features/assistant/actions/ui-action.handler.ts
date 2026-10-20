// Modified by Sekar Nagarajan (2026-10-20 16:53)
import { resolveNavigateRoute } from "./navigate.action";
import {
  applyPrefillBooking,
  type PrefillBookingResult,
} from "./prefill-booking.action";

export type UiActionDispatchResult =
  | { kind: "navigate"; route: string }
  | { kind: "prefill_booking"; result: PrefillBookingResult }
  /** Card only — submit happens in AutomationConfirmCard after explicit confirm. */
  | { kind: "propose_booking_submit"; shown: true }
  | { kind: "show_sql_result"; shown: true }
  | { kind: "unsupported"; name: string }
  | { kind: "invalid_route" };

/**
 * Confirm-gated UI action dispatch (caller shows useConfirm first).
 * Never auto-navigates — returns the intended side-effect for the UI to apply.
 * Never submits bookings — propose_booking_submit is card-only.
 */
export async function dispatchUiAction(
  name: string,
  args: Record<string, unknown>,
): Promise<UiActionDispatchResult> {
  switch (name) {
    case "navigate": {
      const route = resolveNavigateRoute(args);
      if (!route) return { kind: "invalid_route" };
      return { kind: "navigate", route };
    }
    case "prefill_booking": {
      const result = await applyPrefillBooking(args);
      return { kind: "prefill_booking", result };
    }
    case "propose_booking_submit":
      return { kind: "propose_booking_submit", shown: true };
    case "show_sql_result":
      return { kind: "show_sql_result", shown: true };
    default:
      return { kind: "unsupported", name };
  }
}
