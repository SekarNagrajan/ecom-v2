// Modified by Sekar Nagarajan (2026-09-15 14:25)
import { Tag } from "antd";

import type { ScheduleItem } from "../../types/schedules.types";

export function ScheduleListRoutingCell({ record }: { record: ScheduleItem }) {
  const routingLabel = record.isDirect
    ? "Direct"
    : `${record.transshipmentCount} ${
        record.transshipmentCount === 1 ? "Stop" : "Stops"
      }`;

  return (
    <div className="schedule-list-cell__tags">
      <Tag
        className="module-status-tag"
        color={record.isDirect ? "success" : "processing"}
      >
        {routingLabel}
      </Tag>
      {/* {record.isMultimodal ? (
        <Tag className="module-status-tag" color="cyan">
          Multimodal
        </Tag>
      ) : null} */}
    </div>
  );
}

/**
 * Intermediate hubs between POL and POD from leg sequence.
 * Trans 1 = POD of first leg (when multi-leg); Trans 2 = POD of second leg; etc.
 */
export function getTransshipmentHub(
  record: ScheduleItem,
  index: number,
): { code: string; name: string } | null {
  const legs = record.legs ?? [];
  if (legs.length < 2) return null;
  const hubs = legs.slice(0, -1).map((leg) => ({
    code: leg.podPortId,
    name: leg.podPortName,
  }));
  return hubs[index] ?? null;
}

export function ScheduleListTransCell({
  record,
  index,
}: {
  record: ScheduleItem;
  index: number;
}) {
  const hub = getTransshipmentHub(record, index);
  if (!hub?.code) {
    return <span className="schedule-list-cell__sub">—</span>;
  }
  return <span>{hub.code}</span>;
}

export function formatCutoffValue(value?: string): string {
  return value?.trim() ? value : "—";
}
