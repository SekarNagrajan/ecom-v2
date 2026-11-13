// Modified by Sekar Nagarajan (2026-09-15 16:45)
import type { TFunction } from "i18next";
import { z } from "zod";

import { BOOKING_LOOKUPS } from "../booking/mocks/booking-lookups.mock";
import {
  createEmptyCommodity,
  createEmptyContainer,
  type BookingPayload,
} from "../booking/types/booking.types";
import type {
  SpreadsheetImportAdapter,
  SpreadsheetImportGridRow,
  SpreadsheetImportValidationIssue,
} from "../import-workbench/types/import-workbench.types";
import { SPREADSHEET_IMPORT_DUPLICATE_ISSUE_CODE } from "../import-workbench/types/import-workbench.types";
import type { BookingImportValues } from "./types/booking-import.types";

const CONTAINER_TYPE_OPTIONS = BOOKING_LOOKUPS.containerTypes.map((option) => ({
  label: option.label,
  value: option.value,
}));

function createBookingImportRowSchema(t: TFunction) {
  return z.object({
    origin: z.string().trim().min(1, t("validation.originRequired")),
    delivery: z.string().trim().min(1, t("validation.deliveryRequired")),
    cargoReadyDate: z
      .string()
      .trim()
      .min(1, t("validation.cargoReadyDateRequired")),
    shipperName: z.string().trim().min(3, t("validation.shipperNameRequired")),
    agreementParty: z
      .string()
      .trim()
      .min(1, t("validation.agreementPartyRequired")),
    siSubmittingParty: z
      .string()
      .trim()
      .min(1, t("validation.siSubmittingPartyRequired")),
    containerType: z
      .string()
      .trim()
      .min(1, t("validation.containerTypeRequired")),
    quantity: z.coerce.number().int().min(1).max(100),
    hsCode: z.string().trim().min(1, t("validation.hsCodeRequired")),
    weight: z.coerce.number().min(1, t("validation.weightRequired")),
    haulageOriginType: z.enum(["Carrier", "Merchant"]).default("Merchant"),
    haulageDestinationType: z.enum(["Carrier", "Merchant"]).default("Merchant"),
    carriageContract: z.string().optional().default(""),
    agencyReference: z.string().optional().default(""),
    customerReference: z.string().optional().default(""),
    onlineBookingNo: z.string().optional().default(""),
    shipperContact: z.string().optional().default(""),
    shipperEmail: z
      .string()
      .email(t("validation.invalidEmail"))
      .optional()
      .or(z.literal(""))
      .default(""),
    consigneeName: z.string().optional().default(""),
    consigneeContact: z.string().optional().default(""),
    consigneeEmail: z
      .string()
      .email(t("validation.invalidEmail"))
      .optional()
      .or(z.literal(""))
      .default(""),
    notifyPartyName: z.string().optional().default(""),
    notifyPartyContact: z.string().optional().default(""),
    notifyPartyEmail: z
      .string()
      .email(t("validation.invalidEmail"))
      .optional()
      .or(z.literal(""))
      .default(""),
    commodityDescription: z.string().optional().default(""),
  });
}

function createDefaultBookingImportValues(): BookingImportValues {
  return {
    origin: "",
    delivery: "",
    cargoReadyDate: "",
    shipperName: "",
    agreementParty: "",
    siSubmittingParty: "",
    containerType: "20DC",
    quantity: 1,
    hsCode: "",
    weight: 1,
    haulageOriginType: "Merchant",
    haulageDestinationType: "Merchant",
    carriageContract: "",
    agencyReference: "",
    customerReference: "",
    onlineBookingNo: "",
    shipperContact: "",
    shipperEmail: "",
    consigneeName: "",
    consigneeContact: "",
    consigneeEmail: "",
    notifyPartyName: "",
    notifyPartyContact: "",
    notifyPartyEmail: "",
    commodityDescription: "",
  };
}

function zodIssuesToImportIssues(
  error: z.ZodError,
): SpreadsheetImportValidationIssue<BookingImportValues>[] {
  return error.issues.map((issue) => {
    const fieldKey = String(
      issue.path[0] ?? "origin",
    ) as SpreadsheetImportValidationIssue<BookingImportValues>["fieldKey"];
    return {
      fieldKey,
      message: issue.message,
    };
  });
}

function normalizeHaulage(value: string): "Carrier" | "Merchant" {
  const normalized = value.trim().toLowerCase();
  if (normalized === "carrier") {
    return "Carrier";
  }
  return "Merchant";
}

function resolveContainerType(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }
  const byValue = CONTAINER_TYPE_OPTIONS.find(
    (option) => option.value.toLowerCase() === trimmed.toLowerCase(),
  );
  if (byValue) {
    return byValue.value;
  }
  const byLabel = CONTAINER_TYPE_OPTIONS.find(
    (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
  );
  return byLabel?.value ?? trimmed;
}

function toBookingPayload(values: BookingImportValues): BookingPayload {
  const quantity =
    typeof values.quantity === "number"
      ? values.quantity
      : Number(values.quantity);
  const weight =
    typeof values.weight === "number" ? values.weight : Number(values.weight);
  const containerType = resolveContainerType(String(values.containerType));

  const container = createEmptyContainer(containerType || "20DC");
  container.quantity = Number.isFinite(quantity) ? quantity : 1;

  const commodity = createEmptyCommodity();
  commodity.hsCode = String(values.hsCode ?? "").trim();
  commodity.weight = Number.isFinite(weight) ? weight : 1;
  commodity.description = String(values.commodityDescription ?? "").trim();
  container.commodities = [commodity];

  return {
    masterDetails: {
      origin: String(values.origin ?? "").trim(),
      delivery: String(values.delivery ?? "").trim(),
      cargoReadyDate: String(values.cargoReadyDate ?? "").trim(),
      haulageOriginType: normalizeHaulage(String(values.haulageOriginType ?? "")),
      haulageDestinationType: normalizeHaulage(
        String(values.haulageDestinationType ?? ""),
      ),
      carriageContract: String(values.carriageContract ?? "").trim() || undefined,
      onlineBookingNo: String(values.onlineBookingNo ?? "").trim() || undefined,
      agencyReference: String(values.agencyReference ?? "").trim() || undefined,
      customerReference:
        String(values.customerReference ?? "").trim() || undefined,
      selectedRoute: null,
      selectedRate: null,
    },
    parties: {
      shipperName: String(values.shipperName ?? "").trim(),
      shipperContact: String(values.shipperContact ?? "").trim() || undefined,
      shipperEmail: String(values.shipperEmail ?? "").trim() || undefined,
      consigneeName: String(values.consigneeName ?? "").trim() || undefined,
      consigneeContact:
        String(values.consigneeContact ?? "").trim() || undefined,
      consigneeEmail: String(values.consigneeEmail ?? "").trim() || undefined,
      notifyPartyName: String(values.notifyPartyName ?? "").trim() || undefined,
      notifyPartyContact:
        String(values.notifyPartyContact ?? "").trim() || undefined,
      notifyPartyEmail:
        String(values.notifyPartyEmail ?? "").trim() || undefined,
      agreementParty: String(values.agreementParty ?? "").trim(),
      siSubmittingParty: String(values.siSubmittingParty ?? "").trim(),
    },
    cargo: { containers: [container] },
    ens: null,
    insurance: null,
  };
}

function duplicateKey(values: BookingImportValues): string {
  return [
    String(values.origin ?? "").trim().toLowerCase(),
    String(values.delivery ?? "").trim().toLowerCase(),
    String(values.cargoReadyDate ?? "").trim().toLowerCase(),
    String(values.shipperName ?? "").trim().toLowerCase(),
  ].join("|");
}

export function createBookingImportAdapter(
  t: TFunction,
): SpreadsheetImportAdapter<BookingImportValues, BookingPayload> {
  const rowSchema = createBookingImportRowSchema(t);
  const haulageOptions = [
    { label: t("options.haulage.merchant"), value: "Merchant" },
    { label: t("options.haulage.carrier"), value: "Carrier" },
  ];
  const merchantLabel = t("options.haulage.merchant");

  return {
    entityLabel: t("entityLabel"),
    maxRowCount: 200,
    createDefaultValues: createDefaultBookingImportValues,
    fields: [
      // Required first
      {
        key: "origin",
        label: t("columns.origin"),
        aliases: ["POL", "Place of Receipt", "Origin Port"],
        kind: "text",
        required: true,
        width: 140,
        exampleValues: ["AEJEA"],
      },
      {
        key: "delivery",
        label: t("columns.delivery"),
        aliases: ["POD", "Place of Delivery", "Destination"],
        kind: "text",
        required: true,
        width: 140,
        exampleValues: ["SGSIN"],
      },
      {
        key: "cargoReadyDate",
        label: t("columns.cargoReadyDate"),
        aliases: ["CRD", "Ready Date"],
        kind: "date",
        required: true,
        width: 140,
        exampleValues: ["2026-09-20"],
      },
      {
        key: "shipperName",
        label: t("columns.shipperName"),
        aliases: ["Booking Party", "Shipper"],
        kind: "text",
        required: true,
        width: 180,
        exampleValues: ["Acme Shipping LLC"],
      },
      {
        key: "agreementParty",
        label: t("columns.agreementParty"),
        aliases: ["Contract Party"],
        kind: "text",
        required: true,
        width: 160,
        exampleValues: ["Acme Shipping LLC"],
      },
      {
        key: "siSubmittingParty",
        label: t("columns.siSubmittingParty"),
        aliases: ["SI Party"],
        kind: "text",
        required: true,
        width: 160,
        exampleValues: ["Acme Shipping LLC"],
      },
      {
        key: "containerType",
        label: t("columns.containerType"),
        aliases: ["Equipment Type", "Eqp Type"],
        kind: "select",
        required: true,
        width: 160,
        options: CONTAINER_TYPE_OPTIONS,
        defaultDisplayValue: "20' Standard Dry (20DC)",
        useDefaultOnEmpty: true,
        exampleValues: ["20DC"],
      },
      {
        key: "quantity",
        label: t("columns.quantity"),
        aliases: ["Qty", "Container Qty"],
        kind: "number",
        required: true,
        width: 100,
        exampleValues: ["1"],
      },
      {
        key: "hsCode",
        label: t("columns.hsCode"),
        aliases: ["Commodity", "HS"],
        kind: "text",
        required: true,
        width: 120,
        exampleValues: ["8471.30"],
      },
      {
        key: "weight",
        label: t("columns.weight"),
        aliases: ["Cargo Weight", "Gross Weight"],
        kind: "number",
        required: true,
        width: 100,
        exampleValues: ["12000"],
      },
      // Optional
      {
        key: "haulageOriginType",
        label: t("columns.haulageOriginType"),
        aliases: ["Origin Haulage"],
        kind: "select",
        options: haulageOptions,
        defaultDisplayValue: merchantLabel,
        useDefaultOnEmpty: true,
        width: 140,
      },
      {
        key: "haulageDestinationType",
        label: t("columns.haulageDestinationType"),
        aliases: ["Destination Haulage"],
        kind: "select",
        options: haulageOptions,
        defaultDisplayValue: merchantLabel,
        useDefaultOnEmpty: true,
        width: 160,
      },
      {
        key: "carriageContract",
        label: t("columns.carriageContract"),
        aliases: ["Contract"],
        kind: "text",
        width: 140,
      },
      {
        key: "agencyReference",
        label: t("columns.agencyReference"),
        aliases: ["Agency Ref"],
        kind: "text",
        width: 140,
      },
      {
        key: "customerReference",
        label: t("columns.customerReference"),
        aliases: ["Customer Ref", "PO"],
        kind: "text",
        width: 140,
      },
      {
        key: "onlineBookingNo",
        label: t("columns.onlineBookingNo"),
        aliases: ["Online Ref", "Booking Ref"],
        kind: "text",
        width: 140,
      },
      {
        key: "shipperContact",
        label: t("columns.shipperContact"),
        aliases: ["Booking Party Contact"],
        kind: "text",
        width: 140,
      },
      {
        key: "shipperEmail",
        label: t("columns.shipperEmail"),
        aliases: ["Booking Party Email"],
        kind: "text",
        valueFormat: "email",
        width: 180,
        exampleValues: ["shipper@example.com"],
      },
      {
        key: "consigneeName",
        label: t("columns.consigneeName"),
        aliases: ["Consignee"],
        kind: "text",
        width: 160,
      },
      {
        key: "consigneeContact",
        label: t("columns.consigneeContact"),
        aliases: ["Consignee Contact Name"],
        kind: "text",
        width: 140,
      },
      {
        key: "consigneeEmail",
        label: t("columns.consigneeEmail"),
        aliases: ["Consignee Mail"],
        kind: "text",
        valueFormat: "email",
        width: 180,
      },
      {
        key: "notifyPartyName",
        label: t("columns.notifyPartyName"),
        aliases: ["Notify"],
        kind: "text",
        width: 160,
      },
      {
        key: "notifyPartyContact",
        label: t("columns.notifyPartyContact"),
        aliases: ["Notify Contact"],
        kind: "text",
        width: 140,
      },
      {
        key: "notifyPartyEmail",
        label: t("columns.notifyPartyEmail"),
        aliases: ["Notify Email"],
        kind: "text",
        valueFormat: "email",
        width: 180,
      },
      {
        key: "commodityDescription",
        label: t("columns.commodityDescription"),
        aliases: ["Description", "Cargo Description"],
        kind: "text",
        width: 200,
      },
    ],
    validateRecord: (values) => {
      const prepared = {
        ...values,
        containerType: resolveContainerType(String(values.containerType ?? "")),
        haulageOriginType: normalizeHaulage(
          String(values.haulageOriginType ?? "Merchant"),
        ),
        haulageDestinationType: normalizeHaulage(
          String(values.haulageDestinationType ?? "Merchant"),
        ),
      };
      const parsed = rowSchema.safeParse(prepared);
      if (parsed.success) {
        const containerOk = CONTAINER_TYPE_OPTIONS.some(
          (option) => option.value === parsed.data.containerType,
        );
        if (!containerOk) {
          return [
            {
              fieldKey: "containerType",
              message: t("validation.invalidContainerType"),
            },
          ];
        }
        return [];
      }
      return zodIssuesToImportIssues(parsed.error);
    },
    validateBatch: (rows) => {
      const issuesByRowId = new Map<
        string,
        SpreadsheetImportValidationIssue<BookingImportValues>[]
      >();
      const seen = new Map<string, SpreadsheetImportGridRow<BookingImportValues>>();

      for (const row of rows) {
        const key = duplicateKey(row);
        if (!key.replace(/\|/g, "")) {
          continue;
        }
        const prior = seen.get(key);
        if (prior) {
          const issue: SpreadsheetImportValidationIssue<BookingImportValues> = {
            code: SPREADSHEET_IMPORT_DUPLICATE_ISSUE_CODE,
            fieldKey: "origin",
            message: t("errors.duplicateRow"),
          };
          const existing = issuesByRowId.get(row.__rowId) ?? [];
          existing.push(issue);
          issuesByRowId.set(row.__rowId, existing);
        } else {
          seen.set(key, row);
        }
      }

      return issuesByRowId;
    },
    toPayload: toBookingPayload,
    getSubmitLabel: (validRowCount) =>
      t("actions.submit", { count: validRowCount }),
  };
}
