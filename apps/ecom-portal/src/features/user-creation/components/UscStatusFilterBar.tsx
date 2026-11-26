// Modified by Sekar Nagarajan (2026-11-11 15:25)
import type { SubUser } from "../types/user-creation.types";
import {
  countSubUsersByStatus,
  type UscStatusFilter,
} from "../utils/usc.utils";

const FILTERS: {
  key: UscStatusFilter;
  label: string;
  tone: "all" | "accepted" | "invited" | "approval" | "deactivated";
}[] = [
  { key: "all", label: "All", tone: "all" },
  { key: "accepted", label: "Accepted", tone: "accepted" },
  { key: "invited", label: "Invited", tone: "invited" },
  { key: "for_approval", label: "For Approval", tone: "approval" },
  { key: "deactivated", label: "Deactivated", tone: "deactivated" },
];

interface UscStatusFilterBarProps {
  users: SubUser[];
  value: UscStatusFilter;
  onChange: (value: UscStatusFilter) => void;
}

export function UscStatusFilterBar({
  users,
  value,
  onChange,
}: UscStatusFilterBarProps) {
  const counts = countSubUsersByStatus(users);

  return (
    <div className="usc-status-filter" role="tablist" aria-label="Filter by status">
      {FILTERS.map((filter) => {
        const count = counts[filter.key];
        const selected = value === filter.key;
        const empty = filter.key !== "all" && count === 0;
        return (
          <button
            key={filter.key}
            type="button"
            role="tab"
            aria-selected={selected}
            className={[
              "usc-status-filter__pill",
              `usc-status-filter__pill--${filter.tone}`,
              selected ? "usc-status-filter__pill--selected" : undefined,
              empty ? "usc-status-filter__pill--empty" : undefined,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(filter.key)}
          >
         
            <span className="usc-status-filter__label">{filter.label}</span>
            <span className="usc-status-filter__count">({count})</span>
          </button>
        );
      })}
    </div>
  );
}
