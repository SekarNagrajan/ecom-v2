// Modified by Sekar Nagarajan (2026-10-18 10:20)
import { describe, expect, it } from "vitest";

import { normalizeRateEquipment, portCodeFromLabel } from "./rate-equipment";

describe("normalizeRateEquipment", () => {
  it("maps codes in both spellings onto the filter options", () => {
    expect(normalizeRateEquipment("20DC")).toBe("20' Standard Dry");
    expect(normalizeRateEquipment("DV20")).toBe("20' Standard Dry");
    expect(normalizeRateEquipment("40DC")).toBe("40' Standard Dry");
    expect(normalizeRateEquipment("40HC")).toBe("40' High Cube Dry");
    expect(normalizeRateEquipment("HC40")).toBe("40' High Cube Dry");
    expect(normalizeRateEquipment("45HC")).toBe("40' High Cube Dry");
    expect(normalizeRateEquipment("RE20")).toBe("20' Reefer Container");
    expect(normalizeRateEquipment("20RF")).toBe("20' Reefer Container");
    expect(normalizeRateEquipment("40RF")).toBe("40' Reefer Container");
  });

  it("maps equipment-master descriptions and legacy landing labels", () => {
    expect(normalizeRateEquipment("STANDARD 20DC CONTAINER")).toBe("20' Standard Dry");
    expect(normalizeRateEquipment("HIGH CUBE 40 CONTAINER")).toBe("40' High Cube Dry");
    expect(normalizeRateEquipment("REEFER 20 CONTAINER")).toBe("20' Reefer Container");
    expect(normalizeRateEquipment("20' Dry Standard")).toBe("20' Standard Dry");
    expect(normalizeRateEquipment("40' Reefer")).toBe("40' Reefer Container");
  });

  it("keeps option values, maps blank/ALL to ALL and returns unknown values unchanged", () => {
    expect(normalizeRateEquipment("40' High Cube Dry")).toBe("40' High Cube Dry");
    expect(normalizeRateEquipment("")).toBe("ALL");
    expect(normalizeRateEquipment("all")).toBe("ALL");
    expect(normalizeRateEquipment(undefined)).toBe("ALL");
    expect(normalizeRateEquipment("FLEXITANK")).toBe("FLEXITANK");
  });
});

describe("portCodeFromLabel", () => {
  it("extracts the code from a typeahead label or returns the fallback", () => {
    expect(portCodeFromLabel("INNSA - NHAVA SHEVA,MUMBAI")).toBe("INNSA");
    expect(portCodeFromLabel("aejea")).toBe("AEJEA");
    expect(portCodeFromLabel("", "SGSIN")).toBe("SGSIN");
  });
});
