// Created by Sekar Nagarajan (2026-09-01 12:45)
import type { BookingListDTO } from "../../booking/types/booking-list.types";
import type { DashboardShipment } from "../api/dashboard.api";

function formatPort(portId?: string, portDesc?: string): string {
  if (portId && portDesc) return `${portId} - ${portDesc}`;
  return portId || portDesc || "—";
}

function mapShipmentStatus(
  status: DashboardShipment["status"],
): BookingListDTO["status"] {
  switch (status) {
    case "C":
      return "Confirmed";
    case "D":
      return "Draft";
    case "V":
      return "Cancelled";
    case "I":
      return "In Transit";
    default:
      return "Submitted";
  }
}

/** Build a BookingListDTO from an ongoing-dashboard shipment for the view drawer. */
export function mapDashboardShipmentToBookingList(
  shipment: DashboardShipment,
): BookingListDTO {
  const teus = Number.parseFloat(shipment.teus);
  return {
    id: shipment.bookNo,
    bookingNo: shipment.bookNo,
    onlineRefNo: shipment.onlineRefNo || "—",
    agencyRefNo: shipment.invAgency || "",
    status: mapShipmentStatus(shipment.status),
    origin: formatPort(shipment.originPortId, shipment.originPortDesc),
    delivery: formatPort(shipment.finalPortId, shipment.finalPortDesc),
    createdDate: shipment.polAt || "—",
    confirmedDate:
      shipment.status === "C" || shipment.status === "I"
        ? shipment.polAt
        : undefined,
    dgStatus: "N",
    teusCount: Number.isFinite(teus) ? teus : 0,
    submittedDate: shipment.polAt || "—",
  };
}
