// Modified by Sekar Nagarajan (2026-08-31 15:01)
import { z } from "zod";

export type ReferenceFieldType = "text" | "radio";

export type ReferenceFieldKey =
  | "rateRefNo"
  | "agencyRefNo"
  | "oceanFreightTerms"
  | "natCode"
  | "emptyPickupLocation"
  | "finalReceiptPlace"
  | "haulierCode";

export interface ReferenceFieldCatalogItem {
  key: ReferenceFieldKey;
  label: string;
  type: ReferenceFieldType;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
}

export interface ReferenceField {
  id: string;
  key: ReferenceFieldKey;
  name: string;
  type: ReferenceFieldType;
  placeholder?: string;
  options?: string[];
  value: string;
}

export const REFERENCE_FIELD_CATALOG: readonly ReferenceFieldCatalogItem[] = [
  {
    key: "rateRefNo",
    label: "Rate Reference No.",
    type: "text",
    placeholder: "Enter rate reference no.",
  },
  {
    key: "agencyRefNo",
    label: "Agency Ref No.",
    type: "text",
    placeholder: "Enter agency ref no.",
  },
  {
    key: "oceanFreightTerms",
    label: "Ocean Freight Terms",
    type: "radio",
    options: ["Prepaid", "Collect"],
    defaultValue: "Collect",
  },
  {
    key: "natCode",
    label: "NAT Code",
    type: "text",
    placeholder: "Enter nat code",
  },
  {
    key: "emptyPickupLocation",
    label: "Empty Pickup Location",
    type: "text",
    placeholder: "Enter empty pickup location",
  },
  {
    key: "finalReceiptPlace",
    label: "Final Receipt Place",
    type: "text",
    placeholder: "Enter final receipt place",
  },
  {
    key: "haulierCode",
    label: "Haulier Code",
    type: "text",
    placeholder: "Enter haulier code",
  },
] as const;

export const referenceFieldSchema = z.object({
  id: z.string().min(1),
  key: z.enum([
    "rateRefNo",
    "agencyRefNo",
    "oceanFreightTerms",
    "natCode",
    "emptyPickupLocation",
    "finalReceiptPlace",
    "haulierCode",
  ]),
  name: z.string().min(1),
  type: z.enum(["text", "radio"]),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  value: z.string(),
});

export const referenceFieldsSchema = z.object({
  referenceFields: z.array(referenceFieldSchema),
});

export type ReferenceFieldsData = z.infer<typeof referenceFieldsSchema>;

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `ref-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Sample fields for existing booking / SI / BL mocks (amend / edit demos). */
export const MOCK_DEFAULT_REFERENCE_FIELDS: ReferenceField[] = [
  {
    id: "mock-rate-ref",
    key: "rateRefNo",
    name: "Rate Reference No.",
    type: "text",
    placeholder: "Enter rate reference no.",
    value: "RRF-2026-00142",
  },
  {
    id: "mock-agency-ref",
    key: "agencyRefNo",
    name: "Agency Ref No.",
    type: "text",
    placeholder: "Enter agency ref no.",
    value: "AGY-SIN-88421",
  },
  {
    id: "mock-ocean-freight",
    key: "oceanFreightTerms",
    name: "Ocean Freight Terms",
    type: "radio",
    options: ["Prepaid", "Collect"],
    value: "Collect",
  },
];

export function createReferenceField(
  catalogItem: ReferenceFieldCatalogItem,
  preferredValue?: string,
): ReferenceField {
  const value =
    preferredValue?.trim() ||
    catalogItem.defaultValue ||
    (catalogItem.type === "radio" ? (catalogItem.options?.[0] ?? "") : "");

  return {
    id: newId(),
    key: catalogItem.key,
    name: catalogItem.label,
    type: catalogItem.type,
    placeholder: catalogItem.placeholder,
    options: catalogItem.options ? [...catalogItem.options] : undefined,
    value,
  };
}

/**
 * New create flow → empty (user adds manually).
 * Existing amend/edit → show saved fields only (no auto-seed).
 */
export function initialReferenceFields(
  fields: ReferenceField[] | null | undefined,
): ReferenceField[] {
  if (fields && fields.length > 0) {
    return fields.map((f) => ({ ...f }));
  }
  return [];
}

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

const CATALOG_LABEL_KEY: Record<ReferenceFieldKey, string> = {
  rateRefNo: "wizard.references.catalog.rateReferenceNo",
  agencyRefNo: "wizard.references.catalog.agencyRefNo",
  oceanFreightTerms: "wizard.references.catalog.oceanFreightTerms",
  natCode: "wizard.references.catalog.natCode",
  emptyPickupLocation: "wizard.references.catalog.emptyPickupLocation",
  finalReceiptPlace: "wizard.references.catalog.finalReceiptPlace",
  haulierCode: "wizard.references.catalog.haulierCode",
};

const CATALOG_PLACEHOLDER_KEY: Partial<Record<ReferenceFieldKey, string>> = {
  rateRefNo: "wizard.references.catalog.rateReferenceNoPlaceholder",
  agencyRefNo: "wizard.references.catalog.agencyRefNoPlaceholder",
  natCode: "wizard.references.catalog.natCodePlaceholder",
  emptyPickupLocation: "wizard.references.catalog.emptyPickupLocationPlaceholder",
  finalReceiptPlace: "wizard.references.catalog.finalReceiptPlacePlaceholder",
  haulierCode: "wizard.references.catalog.haulierCodePlaceholder",
};

export function localizeReferenceCatalogItem(
  item: ReferenceFieldCatalogItem,
  t: TranslateFn,
): ReferenceFieldCatalogItem {
  return {
    ...item,
    label: t(CATALOG_LABEL_KEY[item.key]),
    placeholder: CATALOG_PLACEHOLDER_KEY[item.key]
      ? t(CATALOG_PLACEHOLDER_KEY[item.key]!)
      : item.placeholder,
  };
}

export function getLocalizedReferenceCatalog(
  t: TranslateFn,
): ReferenceFieldCatalogItem[] {
  return REFERENCE_FIELD_CATALOG.map((item) => localizeReferenceCatalogItem(item, t));
}
