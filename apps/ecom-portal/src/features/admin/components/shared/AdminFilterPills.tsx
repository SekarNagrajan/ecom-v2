// Modified by Sekar Nagarajan (2026-11-12 15:40)
/**
 * Pills that filter a list client-side (same interaction as user-creation's status bar):
 * `role="tablist"` + `aria-selected`, keyboard reachable, tone dot per item.
 */
import type { AdminPillTone } from "./AdminStatusPill";

export interface AdminFilterPillItem<K extends string = string> {
  key: K;
  label: string;
  tone?: AdminPillTone;
}

export interface AdminFilterPillsProps<K extends string = string> {
  items: AdminFilterPillItem<K>[];
  value: K;
  onChange: (key: K) => void;
  ariaLabel?: string;
  className?: string;
}

export function AdminFilterPills<K extends string = string>({
  items,
  value,
  onChange,
  ariaLabel = "Filter",
  className,
}: AdminFilterPillsProps<K>) {
  return (
    <div
      className={["admin-filter-pills", className].filter(Boolean).join(" ")}
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const selected = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={selected}
            className={[
              "admin-filter-pills__pill",
              item.tone ? `admin-filter-pills__pill--${item.tone}` : "",
              selected ? "admin-filter-pills__pill--selected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(item.key)}
          >
            <span className="admin-filter-pills__dot" aria-hidden />
            <span className="admin-filter-pills__label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
