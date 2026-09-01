// Created by Sekar Nagarajan (2026-09-01 12:52)
import type { BLListDTO, BLRowStatus } from "../../bill-of-lading/types/bl.types";
import { BL_STATUS_LABELS } from "../../bill-of-lading/types/bl.types";
import type { DashboardShipment } from "../api/dashboard.api";

function formatPort(portId?: string, portDesc?: string): string {
  if (portId && portDesc) return `${portId} - ${portDesc}`;
  return portId || portDesc || "—";
}

function mapShipmentToBlStatus(
  status: DashboardShipment["status"],
): BLRowStatus {
  switch (status) {
    case "D":
      return "D";
    case "C":
      return "C";
    case "I":
      return "I";
    case "V":
      return "C";
    default:
      return "D";
  }
}

/** Build a BLListDTO from an ongoing-dashboard shipment for the view drawer. */
export function mapDashboardShipmentToBlList(
  shipment: DashboardShipment,
): BLListDTO {
  const status = mapShipmentToBlStatus(shipment.status);
  const origin = formatPort(shipment.originPortId, shipment.originPortDesc);
  const delivery = formatPort(shipment.finalPortId, shipment.finalPortDesc);

  return {
    blNo: shipment.blNo,
    mcnNo: null,
    bookingNo: shipment.bookNo,
    siNo: shipment.siNo || null,
    status,
    statusLabel: BL_STATUS_LABELS[status],
    agencyRefNo: shipment.invAgency || null,
    origin,
    loadPort: origin,
    dischargePort: delivery,
    delivery,
    confirmedDate:
      status === "C" || status === "I" ? shipment.polAt || null : null,
    createdDate: shipment.polAt || null,
    printStatus: "N",
    appVersion: "2",
    isLocked: shipment.status === "V",
  };
}
