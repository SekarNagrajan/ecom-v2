import type {
    SpreadsheetImportAdapter,
    SpreadsheetImportFieldDefinition,
} from "../types/import-workbench.types";

const HEADER_FONT_WEIGHT = "bold" as const;

/**
 * Approximate character-width that maps an AG Grid pixel width (used in the
 * review grid) to Excel's character-based column width. Excel uses ~7-8
 * pixels per character with the default font, so dividing by 8 keeps the
 * template grid roughly aligned with the live workbench grid the user will
 * see after they upload (ISS-11).
 */
const TEMPLATE_PIXELS_PER_CHARACTER = 8;
const MIN_TEMPLATE_COLUMN_WIDTH = 12;
const MAX_TEMPLATE_COLUMN_WIDTH = 60;
const FALLBACK_TEMPLATE_COLUMN_WIDTH = 18;

const FALLBACK_FILE_NAME_SLUG = "import";

function buildTemplateFileName(entityLabel: string): string {
  const slug =
    entityLabel
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || FALLBACK_FILE_NAME_SLUG;
  return `${slug}-template.xlsx`;
}

function pickTemplateExampleValue<TValues extends object>(
  field: SpreadsheetImportFieldDefinition<TValues>,
): string {
  // Prefer the curated `defaultDisplayValue` for select-driven columns
  // (lookup defaults like "New" / "Email") so the example row imports
  // cleanly without the user having to know the underlying option codes.
  if (field.defaultDisplayValue) {
    return field.defaultDisplayValue;
  }

  const firstExample = field.exampleValues?.[0];
  if (typeof firstExample === "string" && firstExample.length > 0) {
    return firstExample;
  }

  return "";
}

function buildTemplateColumnWidth<TValues extends object>(
  field: SpreadsheetImportFieldDefinition<TValues>,
): number {
  if (typeof field.width !== "number" || !Number.isFinite(field.width)) {
    return FALLBACK_TEMPLATE_COLUMN_WIDTH;
  }
  const characters = Math.round(field.width / TEMPLATE_PIXELS_PER_CHARACTER);
  return Math.min(
    MAX_TEMPLATE_COLUMN_WIDTH,
    Math.max(MIN_TEMPLATE_COLUMN_WIDTH, characters),
  );
}

/**
 * Generate and trigger a browser download of an `.xlsx` template tailored
 * to the supplied import adapter. The file contains:
 *
 *  - A bold header row whose labels match the adapter's primary
 *    `field.label` (the same label the import workbench matches on by
 *    default — re-uploading the template parses without unmatched-header
 *    warnings).
 *  - A single example row populated from `defaultDisplayValue` (for
 *    lookup-driven columns) or the first entry in `exampleValues` (for
 *    free-text columns), so the user sees the expected format for each
 *    cell.
 *
 * Designed to live next to the upload dropzone on the leads-import page
 * (ISS-11) but applies to any adapter — accounts / contacts / future
 * import surfaces inherit it for free.
 *
 * `write-excel-file/browser` is loaded via dynamic `import()` so the ~25KB
 * gzipped bundle only ships when the user actually clicks the Download
 * Template button — opening the import workbench (or the rest of the
 * import flow that uses the lighter `read-excel-file` cousin for parsing)
 * does not pull it in.
 */
export async function downloadSpreadsheetImportTemplate<
  TValues extends object,
  TPayload,
>(adapter: SpreadsheetImportAdapter<TValues, TPayload>): Promise<void> {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");

  // Required columns first, then optional — matches empty-state Column Guide.
  const orderedFields = [
    ...adapter.fields.filter((field) => field.required),
    ...adapter.fields.filter((field) => !field.required),
  ];

  const headerRow = orderedFields.map((field) => ({
    value: field.label,
    fontWeight: HEADER_FONT_WEIGHT,
  }));

  const exampleRow = orderedFields.map((field) => ({
    type: String,
    value: pickTemplateExampleValue(field),
  }));

  const columns = orderedFields.map((field) => ({
    width: buildTemplateColumnWidth(field),
  }));

  await writeXlsxFile([headerRow, exampleRow], {
    columns,
    stickyRowsCount: 1,
  }).toFile(buildTemplateFileName(adapter.entityLabel));
}
