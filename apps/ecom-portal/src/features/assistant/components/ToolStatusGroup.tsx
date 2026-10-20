// Created for Phase 6 — once a message completes, its successful tool rows
// collapse into one compact, keyboard-accessible line that expands to reveal
// each individual tool run. Failed tools are NOT grouped here; the bubble keeps
// rendering them as standalone warning rows.
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { ToolRunState } from "../types/assistant.types";
import { ToolStatusRow } from "./ToolStatusRow";

/** Human label for the collapsed summary, reusing each module's own copy. */
const TOOL_LABEL_KEY: Record<string, string> = {
  track_shipment: "cards.tracking.title",
  search_schedules: "cards.schedules.title",
  list_bookings: "cards.records.list_bookings",
  get_booking: "cards.records.get_booking",
  list_shipping_instructions: "cards.records.list_shipping_instructions",
  list_bills_of_lading: "cards.records.list_bills_of_lading",
  list_vgm: "cards.records.list_vgm",
  list_cro: "cards.records.list_cro",
  list_delivery_orders: "cards.records.list_delivery_orders",
  list_arrival_notices: "cards.records.list_arrival_notices",
};

export function ToolStatusGroup({ runs }: { runs: ToolRunState[] }) {
  const { t } = useTranslation("assistant");
  const [open, setOpen] = useState(false);

  if (runs.length === 0) return null;

  const names = runs.map((run) =>
    t(TOOL_LABEL_KEY[run.tool] ?? `tools.${run.tool}.done`, {
      defaultValue: run.tool,
    }),
  );
  const summary = t("toolGroup.summary", { tools: names.join(", ") });

  return (
    <div className="assistant-tool-group">
      <button
        type="button"
        className="assistant-tool-group__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <AppIcon icon={Icons.check} size={14} />
        <span className="assistant-tool-group__summary" title={summary}>
          {summary}
        </span>
        <AppIcon
          icon={open ? Icons.chevronUp : Icons.chevronDown}
          size={14}
        />
      </button>
      {open ? (
        <div className="assistant-tool-group__list">
          {runs.map((run) => (
            <ToolStatusRow key={run.callId} run={run} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
