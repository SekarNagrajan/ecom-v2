// Created by Sekar Nagarajan (2026-09-16 15:32)
import { describe, expect, it } from "vitest";

import {
  applySmartImportCellChange,
  clearSmartImportLineFields,
  containersToSmartImportRows,
  deleteSmartImportRows,
  deleteWouldDropContainer,
  duplicateSmartImportRow,
  insertSmartImportRow,
  smartImportRowsToContainers,
} from "./smart-import/map-smart-import-rows";
import type { SmartImportRow } from "./smart-import/smart-import.types";
import {
  createEmptyCargoLine,
  createEmptyContainer,
  type SIContainer,
} from "./types/si.types";

function buildContainer(
  overrides: Partial<SIContainer> & { id: string; containerNo: string },
): SIContainer {
  const base = createEmptyContainer(overrides.eqpSize ?? "40HC");
  const line = createEmptyCargoLine();
  line.hsCode = "8471.30";
  line.description = "Widgets";
  line.packageType = "CTN";
  line.packageCount = 10;
  line.grossWeight = 1000;
  line.volume = 5;
  line.commodityCode = "GEN";
  line.marksAndNumbers = "N/M";
  return {
    ...base,
    ...overrides,
    cargoLines: overrides.cargoLines ?? [line],
  };
}

describe("containersToSmartImportRows", () => {
  it("flattens containers and cargo lines into grid rows", () => {
    const line2 = createEmptyCargoLine();
    line2.hsCode = "8517.12";
    line2.description = "Gadgets";
    line2.packageType = "PLT";
    line2.packageCount = 2;
    line2.grossWeight = 500;
    line2.volume = 2;
    line2.commodityCode = "ELE";

    const containers = [
      buildContainer({
        id: "c1",
        containerNo: "MSKU1111111",
        isSoc: false,
        cargoLines: [
          {
            ...createEmptyCargoLine(),
            hsCode: "8471.30",
            description: "Widgets",
            packageType: "CTN",
            packageCount: 10,
            grossWeight: 1000,
            volume: 5,
            commodityCode: "GEN",
            marksAndNumbers: "N/M",
          },
          line2,
        ],
      }),
      buildContainer({
        id: "c2",
        containerNo: "MSKU2222222",
        eqpSize: "20GP",
        isSoc: true,
      }),
    ];

    const rows = containersToSmartImportRows(containers);
    expect(rows).toHaveLength(3);
    expect(rows[0]?.containerId).toBe("c1");
    expect(rows[0]?.oldContainerNo).toBe("MSKU1111111");
    expect(rows[0]?.actualContainerNo).toBe("MSKU1111111");
    expect(rows[1]?.hsCode).toBe("8517.12");
    expect(rows[2]?.containerId).toBe("c2");
    expect(rows[2]?.isSoc).toBe(true);
    expect(rows[2]?.eqpSize).toBe("20GP");
  });
});

describe("insertSmartImportRow / deleteSmartImportRows", () => {
  const baseRows = (): SmartImportRow[] =>
    containersToSmartImportRows([
      buildContainer({ id: "c1", containerNo: "MSKU1111111" }),
      buildContainer({ id: "c2", containerNo: "MSKU2222222", eqpSize: "20GP" }),
    ]);

  it("inserts before and clones container identity", () => {
    const rows = baseRows();
    const next = insertSmartImportRow(rows, 0, "before");
    expect(next).toHaveLength(3);
    expect(next[0]?.containerId).toBe(rows[0]?.containerId);
    expect(next[0]?.oldContainerNo).toBe(rows[0]?.oldContainerNo);
    expect(next[0]?.actualContainerNo).toBe(rows[0]?.actualContainerNo);
    expect(next[0]?.eqpSize).toBe(rows[0]?.eqpSize);
    expect(next[0]?.rowId).not.toBe(rows[0]?.rowId);
    expect(next[0]?.hsCode).toBe("");
    expect(next[0]?.description).toBe("");
    expect(next[1]?.rowId).toBe(rows[0]?.rowId);
  });

  it("inserts after the source row", () => {
    const rows = baseRows();
    const next = insertSmartImportRow(rows, 0, "after");
    expect(next).toHaveLength(3);
    expect(next[1]?.containerId).toBe(rows[0]?.containerId);
    expect(next[0]?.rowId).toBe(rows[0]?.rowId);
  });

  it("deletes selected rows by id", () => {
    const rows = baseRows();
    const id = rows[0]?.rowId ?? "";
    const next = deleteSmartImportRows(rows, [id]);
    expect(next).toHaveLength(1);
    expect(next[0]?.containerId).toBe("c2");
  });

  it("duplicates a row with a new rowId after the source", () => {
    const rows = baseRows();
    const next = duplicateSmartImportRow(rows, 0);
    expect(next).toHaveLength(3);
    expect(next[1]?.containerId).toBe(rows[0]?.containerId);
    expect(next[1]?.hsCode).toBe(rows[0]?.hsCode);
    expect(next[1]?.description).toBe(rows[0]?.description);
    expect(next[1]?.rowId).not.toBe(rows[0]?.rowId);
    expect(next[0]?.rowId).toBe(rows[0]?.rowId);
  });

  it("clears line fields but keeps container identity", () => {
    const rows = baseRows();
    const id = rows[0]?.rowId ?? "";
    const next = clearSmartImportLineFields(rows, [id]);
    expect(next[0]?.containerId).toBe(rows[0]?.containerId);
    expect(next[0]?.actualContainerNo).toBe(rows[0]?.actualContainerNo);
    expect(next[0]?.hsCode).toBe("");
    expect(next[0]?.description).toBe("");
    expect(next[0]?.packageCount).toBe(1);
  });
});

describe("smartImportRowsToContainers", () => {
  it("applies actual container no, seals, and SOC; preserves eqp", () => {
    const original = [
      buildContainer({
        id: "c1",
        containerNo: "MSKU1111111",
        eqpSize: "40HC",
        isSoc: false,
        carrierSeal: "OLD",
        shipperSeal: "OLD",
        tareWeight: 42,
      }),
    ];
    const rows = containersToSmartImportRows(original);
    const row = rows[0];
    if (!row) {
      throw new Error("expected row");
    }
    row.actualContainerNo = "msku9999999";
    row.carrierSeal = "CNEW";
    row.shipperSeal = "SNEW";
    row.isSoc = true;
    row.description = "Updated cargo";
    row.hsCode = "9999.99";
    row.packageType = "CTN";
    row.packageCount = 3;
    row.grossWeight = 2000;

    const result = smartImportRowsToContainers(rows, original);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.containers).toHaveLength(1);
    expect(result.containers[0]?.containerNo).toBe("MSKU9999999");
    expect(result.containers[0]?.carrierSeal).toBe("CNEW");
    expect(result.containers[0]?.shipperSeal).toBe("SNEW");
    expect(result.containers[0]?.eqpSize).toBe("40HC");
    expect(result.containers[0]?.isSoc).toBe(true);
    expect(result.containers[0]?.tareWeight).toBe(42);
    expect(result.containers[0]?.cargoLines[0]?.description).toBe(
      "Updated cargo",
    );
  });

  it("rejects when a container loses all rows", () => {
    const original = [
      buildContainer({ id: "c1", containerNo: "MSKU1111111" }),
      buildContainer({ id: "c2", containerNo: "MSKU2222222" }),
    ];
    const rows = containersToSmartImportRows(original);
    const onlyFirst = rows.filter((row) => row.containerId === "c1");
    const result = smartImportRowsToContainers(onlyFirst, original);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error).toContain("container count does not match");
    expect(result.error).toContain("SI(2)");
    expect(result.error).toContain("Smart Import(1)");
  });

  it("adds commodity lines for a container via insert", () => {
    const original = [
      buildContainer({ id: "c1", containerNo: "MSKU1111111" }),
    ];
    let rows = containersToSmartImportRows(original);
    rows = insertSmartImportRow(rows, 0, "after");
    const second = rows[1];
    if (!second) {
      throw new Error("expected second row");
    }
    second.hsCode = "1111.11";
    second.description = "Second line";
    second.packageType = "CTN";
    second.packageCount = 1;
    second.grossWeight = 100;

    const result = smartImportRowsToContainers(rows, original);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.containers[0]?.cargoLines).toHaveLength(2);
    expect(result.containers[0]?.cargoLines[1]?.description).toBe(
      "Second line",
    );
  });
});

describe("applySmartImportCellChange", () => {
  it("propagates actual container no to all lines of the same container", () => {
    const line2 = createEmptyCargoLine();
    line2.hsCode = "8517.12";
    line2.description = "Gadgets";
    line2.packageType = "PLT";
    line2.packageCount = 2;
    line2.grossWeight = 500;
    line2.volume = 2;
    line2.commodityCode = "ELE";

    const rows = containersToSmartImportRows([
      buildContainer({
        id: "c1",
        containerNo: "MSKU1111111",
        cargoLines: [
          {
            ...createEmptyCargoLine(),
            hsCode: "8471.30",
            description: "Widgets",
            packageType: "CTN",
            packageCount: 10,
            grossWeight: 1000,
            volume: 5,
            commodityCode: "GEN",
            marksAndNumbers: "N/M",
          },
          line2,
        ],
      }),
      buildContainer({ id: "c2", containerNo: "MSKU2222222" }),
    ]);

    const firstId = rows[0]?.rowId ?? "";
    const next = applySmartImportCellChange(
      rows,
      firstId,
      "actualContainerNo",
      "msku9999999",
    );
    expect(next[0]?.actualContainerNo).toBe("MSKU9999999");
    expect(next[1]?.actualContainerNo).toBe("MSKU9999999");
    expect(next[2]?.actualContainerNo).toBe("MSKU2222222");
  });

  it("coerces numeric weight edits", () => {
    const rows = containersToSmartImportRows([
      buildContainer({ id: "c1", containerNo: "MSKU1111111" }),
    ]);
    const id = rows[0]?.rowId ?? "";
    const next = applySmartImportCellChange(rows, id, "grossWeight", "1,250 kg");
    expect(next[0]?.grossWeight).toBe(1250);
  });

  it("propagates SOC checkbox to all lines of the same container", () => {
    const line2 = createEmptyCargoLine();
    line2.hsCode = "8517.12";
    line2.description = "Gadgets";
    line2.packageType = "PLT";
    line2.packageCount = 2;
    line2.grossWeight = 500;
    line2.volume = 2;
    line2.commodityCode = "ELE";

    const rows = containersToSmartImportRows([
      buildContainer({
        id: "c1",
        containerNo: "MSKU1111111",
        isSoc: false,
        cargoLines: [
          {
            ...createEmptyCargoLine(),
            hsCode: "8471.30",
            description: "Widgets",
            packageType: "CTN",
            packageCount: 10,
            grossWeight: 1000,
            volume: 5,
            commodityCode: "GEN",
            marksAndNumbers: "N/M",
          },
          line2,
        ],
      }),
    ]);
    const next = applySmartImportCellChange(
      rows,
      rows[0]?.rowId ?? "",
      "isSoc",
      true,
    );
    expect(next[0]?.isSoc).toBe(true);
    expect(next[1]?.isSoc).toBe(true);
  });
});

describe("deleteWouldDropContainer", () => {
  it("detects when delete removes the last line for a container", () => {
    const rows = containersToSmartImportRows([
      buildContainer({ id: "c1", containerNo: "MSKU1111111" }),
      buildContainer({ id: "c2", containerNo: "MSKU2222222" }),
    ]);
    expect(deleteWouldDropContainer(rows, [rows[0]?.rowId ?? ""])).toBe(true);
    expect(deleteWouldDropContainer(rows, [])).toBe(false);
  });
});
