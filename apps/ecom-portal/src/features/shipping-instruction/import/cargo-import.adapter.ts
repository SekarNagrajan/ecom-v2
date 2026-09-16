// Modified by Sekar Nagarajan (2026-09-16 15:12)
import { z } from "zod";

import { BOOKING_LOOKUPS } from "../../booking/mocks/booking-lookups.mock";
import type {
  SpreadsheetImportAdapter,
  SpreadsheetImportValidationIssue,
} from "../../import-workbench/types/import-workbench.types";
import { SPREADSHEET_IMPORT_DUPLICATE_ISSUE_CODE } from "../../import-workbench/types/import-workbench.types";
import type {
  CargoImportPayload,
  CargoImportValues,
} from "./cargo-import.types";

const CONTAINER_TYPE_OPTIONS = BOOKING_LOOKUPS.containerTypes.map((option) => ({
  label: option.label,
  value: option.value,
}));

const PACKAGE_TYPE_OPTIONS = BOOKING_LOOKUPS.packageTypes.map((option) => ({
  label: option.label,
  value: option.value,
}));

const cargoImportRowSchema = z.object({
  containerNo: z
    .string()
    .trim()
    .min(1, "Container No is required")
    .max(11, "Container No must be 11 characters or fewer"),
  containerType: z.string().trim().min(1, "Container Type is required"),
  carrierSeal: z.string().trim().optional().default(""),
  shipperSeal: z.string().trim().optional().default(""),
  marksAndNumbers: z.string().trim().optional().default(""),
  description: z.string().trim().min(1, "Commodity Description is required"),
  hsCode: z.string().trim().min(1, "HS Code is required"),
  commodityCode: z.string().trim().optional().default(""),
  packageCount: z.coerce.number().int().min(1, "Package Count must be at least 1"),
  packageType: z.string().trim().min(1, "Package Type is required"),
  grossWeight: z.coerce.number().min(1, "Gross Weight is required"),
  volume: z.coerce.number().min(0, "Volume cannot be negative").default(0),
});

function createDefaultCargoImportValues(): CargoImportValues {
  return {
    containerNo: "",
    containerType: "40HC",
    carrierSeal: "",
    shipperSeal: "",
    marksAndNumbers: "",
    description: "",
    hsCode: "",
    commodityCode: "",
    packageCount: 1,
    packageType: "CTN",
    grossWeight: 1,
    volume: 0,
  };
}

function zodIssuesToImportIssues(
  error: z.ZodError,
): SpreadsheetImportValidationIssue<CargoImportValues>[] {
  return error.issues.map((issue) => {
    const fieldKey = String(
      issue.path[0] ?? "containerNo",
    ) as SpreadsheetImportValidationIssue<CargoImportValues>["fieldKey"];
    return {
      fieldKey,
      message: issue.message,
    };
  });
}

function resolveLookupValue(
  raw: string,
  options: readonly { label: string; value: string }[],
): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }
  const byValue = options.find(
    (option) => option.value.toLowerCase() === trimmed.toLowerCase(),
  );
  if (byValue) {
    return byValue.value;
  }
  const byLabel = options.find(
    (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
  );
  return byLabel?.value ?? trimmed;
}

function resolveContainerType(raw: string): string {
  return resolveLookupValue(raw, CONTAINER_TYPE_OPTIONS);
}

function resolvePackageType(raw: string): string {
  return resolveLookupValue(raw, PACKAGE_TYPE_OPTIONS);
}

function prepareValues(values: CargoImportValues): CargoImportValues {
  return {
    ...values,
    containerNo: String(values.containerNo ?? "").trim().toUpperCase(),
    containerType: resolveContainerType(String(values.containerType ?? "")),
    carrierSeal: String(values.carrierSeal ?? "").trim(),
    shipperSeal: String(values.shipperSeal ?? "").trim(),
    marksAndNumbers: String(values.marksAndNumbers ?? "").trim(),
    description: String(values.description ?? "").trim(),
    hsCode: String(values.hsCode ?? "").trim(),
    commodityCode: String(values.commodityCode ?? "").trim(),
    packageType: resolvePackageType(String(values.packageType ?? "")),
    packageCount:
      typeof values.packageCount === "number"
        ? values.packageCount
        : Number(values.packageCount),
    grossWeight:
      typeof values.grossWeight === "number"
        ? values.grossWeight
        : Number(values.grossWeight),
    volume:
      typeof values.volume === "number"
        ? values.volume
        : Number(values.volume) || 0,
  };
}

function toPayload(values: CargoImportValues): CargoImportPayload {
  const prepared = prepareValues(values);
  return {
    ...prepared,
    packageCount: Number.isFinite(prepared.packageCount)
      ? prepared.packageCount
      : 1,
    grossWeight: Number.isFinite(prepared.grossWeight)
      ? prepared.grossWeight
      : 1,
    volume: Number.isFinite(prepared.volume) ? prepared.volume : 0,
  };
}

function lineDuplicateKey(values: CargoImportValues): string {
  return [
    String(values.containerNo ?? "").trim().toUpperCase(),
    String(values.hsCode ?? "").trim().toLowerCase(),
    String(values.description ?? "").trim().toLowerCase(),
    String(values.packageCount ?? ""),
  ].join("|");
}

export function createCargoImportAdapter(): SpreadsheetImportAdapter<
  CargoImportValues,
  CargoImportPayload
> {
  return {
    entityLabel: "cargo lines",
    maxRowCount: 500,
    createDefaultValues: createDefaultCargoImportValues,
    getSubmitLabel: (validRowCount) =>
      `Import ${validRowCount} cargo line${validRowCount === 1 ? "" : "s"}`,
    fields: [
      {
        key: "containerNo",
        label: "Container No",
        aliases: ["Container", "Container Number", "Cntr No"],
        kind: "text",
        required: true,
        width: 140,
        exampleValues: ["MSKU1234567"],
      },
      {
        key: "containerType",
        label: "Container Type",
        aliases: ["Equipment Type", "Eqp Type", "Eqp Size", "Type"],
        kind: "select",
        required: true,
        width: 160,
        options: CONTAINER_TYPE_OPTIONS,
        defaultDisplayValue: "40' High Cube Dry (40HC)",
        useDefaultOnEmpty: true,
        exampleValues: ["40HC"],
      },
      {
        key: "carrierSeal",
        label: "Carrier Seal",
        aliases: ["Carrier Seal No", "Seal Carrier"],
        kind: "text",
        width: 120,
        exampleValues: ["CSEAL001"],
      },
      {
        key: "shipperSeal",
        label: "Shipper Seal",
        aliases: ["Shipper Seal No", "Seal Shipper"],
        kind: "text",
        width: 120,
        exampleValues: ["SSEAL001"],
      },
      {
        key: "marksAndNumbers",
        label: "Marks & Numbers",
        aliases: ["Marks", "Marks and Numbers", "Shipping Marks"],
        kind: "text",
        width: 140,
        exampleValues: ["N/M"],
      },
      {
        key: "description",
        label: "Commodity Description",
        aliases: ["Description", "Cargo Description", "Commodity"],
        kind: "text",
        required: true,
        width: 200,
        exampleValues: ["General merchandise"],
      },
      {
        key: "hsCode",
        label: "HS Code",
        aliases: ["HS", "Harmonized Code", "Commodity HS"],
        kind: "text",
        required: true,
        width: 120,
        exampleValues: ["8471.30"],
      },
      {
        key: "commodityCode",
        label: "Commodity Code",
        aliases: ["Commodity Cd", "CMDTY"],
        kind: "text",
        width: 140,
        exampleValues: ["GEN-CGO"],
      },
      {
        key: "packageCount",
        label: "Package Count",
        aliases: ["Qty", "Quantity", "Packages", "Pkg Count"],
        kind: "number",
        required: true,
        width: 110,
        exampleValues: ["10"],
      },
      {
        key: "packageType",
        label: "Package Type",
        aliases: ["Pkg Type", "Packaging"],
        kind: "select",
        required: true,
        width: 140,
        options: PACKAGE_TYPE_OPTIONS,
        defaultDisplayValue: "Cartons (CTN)",
        useDefaultOnEmpty: true,
        exampleValues: ["CTN"],
      },
      {
        key: "grossWeight",
        label: "Gross Weight",
        aliases: ["Weight", "Gross Wt", "Weight Kg"],
        kind: "number",
        required: true,
        width: 120,
        exampleValues: ["12000"],
      },
      {
        key: "volume",
        label: "Volume",
        aliases: ["CBM", "Volume CBM", "Cubic Meters"],
        kind: "number",
        width: 100,
        exampleValues: ["25"],
      },
    ],
    validateRecord: (values) => {
      const prepared = prepareValues(values);
      const parsed = cargoImportRowSchema.safeParse(prepared);
      if (!parsed.success) {
        return zodIssuesToImportIssues(parsed.error);
      }

      const issues: SpreadsheetImportValidationIssue<CargoImportValues>[] = [];
      const containerOk = CONTAINER_TYPE_OPTIONS.some(
        (option) => option.value === parsed.data.containerType,
      );
      if (!containerOk) {
        issues.push({
          fieldKey: "containerType",
          message: "Select a valid container type",
        });
      }
      const packageOk = PACKAGE_TYPE_OPTIONS.some(
        (option) => option.value === parsed.data.packageType,
      );
      if (!packageOk) {
        issues.push({
          fieldKey: "packageType",
          message: "Select a valid package type",
        });
      }
      return issues;
    },
    validateBatch: (rows) => {
      const issuesByRowId = new Map<
        string,
        SpreadsheetImportValidationIssue<CargoImportValues>[]
      >();
      const seen = new Map<string, string>();

      for (const row of rows) {
        const containerNo = String(row.containerNo ?? "").trim();
        if (!containerNo) {
          continue;
        }
        const key = lineDuplicateKey(row);
        const priorRowId = seen.get(key);
        if (priorRowId) {
          const issue: SpreadsheetImportValidationIssue<CargoImportValues> = {
            code: SPREADSHEET_IMPORT_DUPLICATE_ISSUE_CODE,
            fieldKey: "containerNo",
            message:
              "Duplicate cargo line for the same container, HS code, description, and package count",
          };
          const existing = issuesByRowId.get(row.__rowId) ?? [];
          existing.push(issue);
          issuesByRowId.set(row.__rowId, existing);
        } else {
          seen.set(key, row.__rowId);
        }
      }

      return issuesByRowId;
    },
    toPayload,
  };
}

/** @deprecated Prefer createCargoImportAdapter */
export const createBlCargoImportAdapter = createCargoImportAdapter;
