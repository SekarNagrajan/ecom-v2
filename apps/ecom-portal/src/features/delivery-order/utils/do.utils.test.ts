// Modified by Sekar Nagarajan (2026-10-19 00:20)
import { describe, expect, it } from "vitest";

import { canPrintDoOnline, getDoValidity, parsePortLabel, validityProgressPercent } from "./do.utils";

const NOW = new Date(2026, 9, 18, 12, 0);

describe("delivery-order validity helpers", () => {
  it("classifies the validity date against today in calendar days", () => {
    // local-time dates: calendar days are counted in the user's time zone
    expect(getDoValidity("2026-10-30T00:00:00", NOW)).toEqual({ state: "valid", daysLeft: 12 });
    expect(getDoValidity("2026-10-20T23:00:00", NOW)).toEqual({ state: "expiring", daysLeft: 2 });
    expect(getDoValidity("2026-10-18T06:00:00", NOW)).toEqual({ state: "expiring", daysLeft: 0 });
    expect(getDoValidity("2026-10-10T00:00:00", NOW)).toEqual({ state: "expired", daysLeft: -8 });
    expect(getDoValidity("", NOW)).toEqual({ state: "unknown", daysLeft: null });
    expect(getDoValidity("not a date", NOW)).toEqual({ state: "unknown", daysLeft: null });
  });

  it("measures how much of the free-time window has elapsed", () => {
    expect(validityProgressPercent("2026-10-08T12:00:00", "2026-10-28T12:00:00", NOW)).toBe(50);
    expect(validityProgressPercent("2026-10-20T12:00:00", "2026-10-28T12:00:00", NOW)).toBe(0);
    expect(validityProgressPercent("2026-09-01T12:00:00", "2026-09-10T12:00:00", NOW)).toBe(100);
    expect(validityProgressPercent(null, "2026-09-10T12:00:00", NOW)).toBe(100);
    expect(validityProgressPercent(null, null, NOW)).toBe(0);
  });

  it("allows online printing once the B/L is released and for legacy rows without the flag", () => {
    expect(canPrintDoOnline({ ecomprintstatus: "1" })).toBe(true);
    expect(canPrintDoOnline({ ecomprintstatus: "" })).toBe(true);
    expect(canPrintDoOnline({ ecomprintstatus: "0" })).toBe(false);
  });

  it("splits port labels into code and name", () => {
    expect(parsePortLabel("INNSA - NHAVA SHEVA,MUMBAI")).toEqual({ code: "INNSA", name: "NHAVA SHEVA,MUMBAI" });
    expect(parsePortLabel("AEJEA")).toEqual({ code: "AEJEA", name: "AEJEA" });
  });
});
