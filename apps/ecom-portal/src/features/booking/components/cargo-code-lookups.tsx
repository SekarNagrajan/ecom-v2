// Modified by Sekar Nagarajan (2026-08-28 12:09)
import { AutoComplete, Input } from "antd";
import { useState } from "react";

import { bookingApi } from "../api/booking.api";
import type {
  BookingHsCodeOption,
  BookingUnNumberOption,
} from "../mocks/booking-hs-un.mock";

function formatCommodityDisplay(code?: string, name?: string): string {
  const trimmedCode = (code ?? "").trim();
  const trimmedName = (name ?? "").trim();
  if (trimmedCode && trimmedName) return `${trimmedCode} — ${trimmedName}`;
  return trimmedCode;
}

export function HsCodeAutoComplete({
  value,
  commodityName,
  onChange,
  onSelectOption,
  onClearName,
  status,
}: {
  value?: string;
  /** Commodity / HS description shown with the code in one field. */
  commodityName?: string;
  onChange: (value: string) => void;
  onSelectOption: (opt: BookingHsCodeOption) => void;
  /** Clears the paired name when the user types a new search. */
  onClearName?: () => void;
  status?: "error" | "warning";
}) {
  const [options, setOptions] = useState<BookingHsCodeOption[]>([]);
  const [fetching, setFetching] = useState(false);
  const [typing, setTyping] = useState(false);

  const displayValue = typing
    ? (value ?? "")
    : formatCommodityDisplay(value, commodityName);

  const runSearch = async (q: string) => {
    setFetching(true);
    try {
      const data = await bookingApi.searchHsCodes(q);
      setOptions(data);
    } catch {
      setOptions([]);
    } finally {
      setFetching(false);
    }
  };

  return (
    <AutoComplete
      value={displayValue}
      size="large"
      className="form-field-full-width"
      options={options.map((o) => ({
        value: o.code,
        label: `${o.code} — ${o.desc}`,
      }))}
      onSearch={(q) => {
        void runSearch(q);
      }}
      onSelect={(val) => {
        setTyping(false);
        const match = options.find((o) => o.code === val);
        if (match) onSelectOption(match);
        else onChange(String(val));
      }}
      onChange={(val) => {
        setTyping(true);
        let next = String(val ?? "");
        if (next.includes(" — ")) {
          next = next.split(" — ")[0]?.trim() ?? next;
        }
        onChange(next);
        onClearName?.();
      }}
      onBlur={() => setTyping(false)}
      notFoundContent={fetching ? "Searching…" : undefined}
    >
      <Input
        size="large"
        placeholder="Search commodity code or name"
        allowClear
        status={status}
      />
    </AutoComplete>
  );
}

export function UnNumberAutoComplete({
  value,
  onChange,
  onSelectOption,
}: {
  value?: string;
  onChange: (value: string) => void;
  onSelectOption: (opt: BookingUnNumberOption) => void;
}) {
  const [options, setOptions] = useState<BookingUnNumberOption[]>([]);
  const [fetching, setFetching] = useState(false);

  const runSearch = async (q: string) => {
    setFetching(true);
    try {
      const data = await bookingApi.searchUnNumbers(q);
      setOptions(data);
    } catch {
      setOptions([]);
    } finally {
      setFetching(false);
    }
  };

  return (
    <AutoComplete
      value={value}
      size="large"
      className="form-field-full-width"
      options={options.map((o) => ({
        value: o.un,
        label: `${o.un} — ${o.name} (Class ${o.dgClass})`,
      }))}
      onSearch={(q) => {
        void runSearch(q);
      }}
      onSelect={(val) => {
        const match = options.find((o) => o.un === val);
        if (match) onSelectOption(match);
        else onChange(String(val));
      }}
      onChange={(val) => onChange(String(val ?? ""))}
      notFoundContent={fetching ? "Searching…" : undefined}
    >
      <Input size="large" placeholder="e.g. 1993" allowClear />
    </AutoComplete>
  );
}
