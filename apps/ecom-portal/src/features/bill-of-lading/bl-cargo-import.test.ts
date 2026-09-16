// Modified by Sekar Nagarajan (2026-09-16 14:31)
import { describe, expect, it } from "vitest";

import { createBlCargoImportAdapter } from "./import/bl-cargo-import.adapter";
import type { BlCargoImportPayload } from "./import/bl-cargo-import.types";
import { mapCargoImportRows } from "./import/map-cargo-import-rows";

describe("createBlCargoImportAdapter", () => {
  const adapter = createBlCargoImportAdapter();

  it("flags missing required fields", () => {
    const issues = adapter.validateRecord(adapter.createDefaultValues());
    const fields = new Set(issues.map((issue) => issue.fieldKey));
    expect(fields.has("containerNo")).toBe(true);
    expect(fields.has("description")).toBe(true);
    expect(fields.has("hsCode")).toBe(true);
  });

  it("accepts a complete cargo line row", () => {
    const issues = adapter.validateRecord({
      containerNo: "MSKU1234567",
      containerType: "40HC",
      carrierSeal: "CSEAL001",
      shipperSeal: "SSEAL001",
      marksAndNumbers: "N/M",
      description: "General merchandise",
      hsCode: "8471.30",
      commodityCode: "GEN-CGO",
      packageCount: 10,
      packageType: "CTN",
      grossWeight: 12000,
      volume: 25,
    });
    expect(issues).toEqual([]);
  });

  it("resolves container type labels to option values", () => {
    const payload = adapter.toPayload({
      ...adapter.createDefaultValues(),
      containerNo: "MSKU1234567",
      containerType: "40' High Cube Dry (40HC)",
      description: "Parts",
      hsCode: "8471.30",
      packageCount: 1,
      packageType: "Cartons (CTN)",
      grossWeight: 1000,
      volume: 5,
    });
    expect(payload.containerType).toBe("40HC");
    expect(payload.packageType).toBe("CTN");
  });
});

describe("mapCargoImportRows", () => {
  const baseRow = (
    overrides: Partial<BlCargoImportPayload>,
  ): BlCargoImportPayload => ({
    containerNo: "MSKU1234567",
    containerType: "20DC",
    carrierSeal: "CSEAL001",
    shipperSeal: "SSEAL001",
    marksAndNumbers: "N/M",
    description: "General merchandise",
    hsCode: "8471.30",
    commodityCode: "GEN-CGO",
    packageCount: 10,
    packageType: "CTN",
    grossWeight: 12000,
    volume: 25,
    ...overrides,
  });

  it("maps a single row to one container with one cargo line", () => {
    const containers = mapCargoImportRows([baseRow({})]);
    expect(containers).toHaveLength(1);
    expect(containers[0]?.containerNo).toBe("MSKU1234567");
    expect(containers[0]?.eqpSize).toBe("20DC");
    expect(containers[0]?.cargoLines).toHaveLength(1);
    expect(containers[0]?.cargoLines[0]?.hsCode).toBe("8471.30");
    expect(containers[0]?.cargoLines[0]?.packageCount).toBe(10);
  });

  it("groups multiple lines for the same container number", () => {
    const containers = mapCargoImportRows([
      baseRow({ description: "Line A", hsCode: "1111.11", packageCount: 2 }),
      baseRow({
        containerNo: "msku1234567",
        description: "Line B",
        hsCode: "2222.22",
        packageCount: 3,
      }),
    ]);
    expect(containers).toHaveLength(1);
    expect(containers[0]?.cargoLines).toHaveLength(2);
    expect(containers[0]?.cargoLines.map((line) => line.hsCode)).toEqual([
      "1111.11",
      "2222.22",
    ]);
  });

  it("creates separate containers for different container numbers", () => {
    const containers = mapCargoImportRows([
      baseRow({ containerNo: "MSKU1111111" }),
      baseRow({ containerNo: "MSKU2222222", containerType: "40HC" }),
    ]);
    expect(containers).toHaveLength(2);
    expect(containers.map((c) => c.containerNo)).toEqual([
      "MSKU1111111",
      "MSKU2222222",
    ]);
    expect(containers[1]?.eqpSize).toBe("40HC");
  });

  it("skips rows without a container number", () => {
    const containers = mapCargoImportRows([
      baseRow({ containerNo: "   " }),
      baseRow({ containerNo: "MSKU9999999" }),
    ]);
    expect(containers).toHaveLength(1);
    expect(containers[0]?.containerNo).toBe("MSKU9999999");
  });

  it("hydrates commit payload into non-empty containers (not empty wipe)", () => {
    const payloads = [
      baseRow({ containerNo: "MSKU5555555", packageCount: 4 }),
      baseRow({
        containerNo: "MSKU5555555",
        description: "Second line",
        hsCode: "9999.99",
        packageCount: 1,
      }),
    ];
    const containers = mapCargoImportRows(payloads);
    expect(containers.length).toBeGreaterThan(0);
    expect(containers).not.toEqual([]);
    expect(containers[0]?.cargoLines.length).toBe(2);
  });
});
