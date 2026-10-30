// Modified by Sekar Nagarajan (2026-09-16 15:12)
import { describe, expect, it } from "vitest";

import { createCargoImportAdapter } from "./import/cargo-import.adapter";
import type { CargoImportPayload } from "./import/cargo-import.types";
import { mapCargoImportRows } from "./import/map-cargo-import-rows";

describe("createCargoImportAdapter", () => {
  const adapter = createCargoImportAdapter();

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
      description: "General merchandise",
      hsCode: "8471.30",
      packageCount: 10,
      packageType: "Cartons (CTN)",
      grossWeight: 12000,
      volume: 25,
    });
    expect(payload.containerType).toBe("40HC");
    expect(payload.packageType).toBe("CTN");
  });

  it("flags duplicate cargo lines in a batch", () => {
    const row = {
      ...adapter.createDefaultValues(),
      __rowId: "r1",
      containerNo: "MSKU1234567",
      description: "General merchandise",
      hsCode: "8471.30",
      packageCount: 10,
    };
    const issues = adapter.validateBatch?.([
      row,
      { ...row, __rowId: "r2" },
    ]);
    expect(issues?.get("r2")?.some((i) => i.fieldKey === "containerNo")).toBe(
      true,
    );
  });
});

describe("mapCargoImportRows", () => {
  it("groups rows by container number into SIContainer[]", () => {
    const rows: CargoImportPayload[] = [
      {
        containerNo: "MSKU1111111",
        containerType: "40HC",
        carrierSeal: "C1",
        shipperSeal: "S1",
        marksAndNumbers: "N/M",
        description: "Widgets",
        hsCode: "8471.30",
        commodityCode: "GEN",
        packageCount: 5,
        packageType: "CTN",
        grossWeight: 1000,
        volume: 10,
      },
      {
        containerNo: "msku1111111",
        containerType: "20GP",
        carrierSeal: "C2",
        shipperSeal: "S2",
        marksAndNumbers: "M2",
        description: "Gadgets",
        hsCode: "8517.12",
        commodityCode: "ELE",
        packageCount: 2,
        packageType: "PLT",
        grossWeight: 500,
        volume: 5,
      },
      {
        containerNo: "MSKU2222222",
        containerType: "20GP",
        carrierSeal: "C3",
        shipperSeal: "S3",
        marksAndNumbers: "M3",
        description: "Parts",
        hsCode: "8708.99",
        commodityCode: "AUT",
        packageCount: 1,
        packageType: "CTN",
        grossWeight: 200,
        volume: 1,
      },
    ];

    const containers = mapCargoImportRows(rows);
    expect(containers).toHaveLength(2);
    expect(containers[0]?.containerNo).toBe("MSKU1111111");
    expect(containers[0]?.eqpSize).toBe("40HC");
    expect(containers[0]?.carrierSeal).toBe("C1");
    expect(containers[0]?.cargoLines).toHaveLength(2);
    expect(containers[0]?.cargoLines[1]?.description).toBe("Gadgets");
    expect(containers[1]?.containerNo).toBe("MSKU2222222");
    expect(containers[1]?.cargoLines).toHaveLength(1);
  });

  it("skips rows without container numbers", () => {
    const containers = mapCargoImportRows([
      {
        containerNo: "   ",
        containerType: "40HC",
        carrierSeal: "",
        shipperSeal: "",
        marksAndNumbers: "",
        description: "Empty cntr",
        hsCode: "1",
        commodityCode: "",
        packageCount: 1,
        packageType: "CTN",
        grossWeight: 1,
        volume: 0,
      },
    ]);
    expect(containers).toEqual([]);
  });
});
