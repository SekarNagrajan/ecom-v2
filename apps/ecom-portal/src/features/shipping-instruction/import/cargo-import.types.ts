// Modified by Sekar Nagarajan (2026-09-16 15:12)
/** Flat Excel row values for SI / BL cargo spreadsheet import. */
export interface CargoImportValues {
  containerNo: string;
  containerType: string;
  carrierSeal: string;
  shipperSeal: string;
  marksAndNumbers: string;
  description: string;
  hsCode: string;
  commodityCode: string;
  packageCount: number;
  packageType: string;
  grossWeight: number;
  volume: number;
}

/** Payload passed from workbench commit — one cargo line row. */
export type CargoImportPayload = CargoImportValues;

/** @deprecated Use CargoImportValues */
export type BlCargoImportValues = CargoImportValues;
/** @deprecated Use CargoImportPayload */
export type BlCargoImportPayload = CargoImportPayload;
