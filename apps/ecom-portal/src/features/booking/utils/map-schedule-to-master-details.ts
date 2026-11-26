import dayjs from "dayjs";

import type { ScheduleItem } from "../../schedules/types/schedules.types";
import type { MasterDetailsData, SelectedRoute } from "../types/booking.types";

function portDisplay(code: string, name: string): string {
  const trimmedCode = code.trim();
  const trimmedName = name.trim();
  if (!trimmedCode) return trimmedName;
  if (!trimmedName) return trimmedCode;
  if (trimmedName.startsWith(`${trimmedCode} - `)) return trimmedName;
  return `${trimmedCode} - ${trimmedName}`;
}

function shipmentKindForSchedule(
  schedule: ScheduleItem,
): SelectedRoute["shipmentKind"] {
  if (schedule.isMultimodal) return "Multimodal";
  if (schedule.isDirect) return "Direct";
  return "Transshipment";
}

function cargoReadyDateFromSchedule(schedule: ScheduleItem): string {
  const fromEtd = dayjs(schedule.etd);
  if (fromEtd.isValid()) {
    return fromEtd.format("YYYY-MM-DD");
  }
  return dayjs().format("YYYY-MM-DD");
}

/** Map a schedule sailing into the booking SelectedRoute shape. */
export function mapScheduleToSelectedRoute(
  schedule: ScheduleItem,
): SelectedRoute {
  return {
    routeId: schedule.id,
    serviceCode: schedule.serviceCode,
    serviceName: schedule.serviceName,
    vesselCode: schedule.vesselCode,
    vesselName: schedule.vesselName,
    voyage: schedule.voyage,
    bound: schedule.bound,
    polPortId: schedule.polPortId,
    polPortName: schedule.polPortName,
    podPortId: schedule.podPortId,
    podPortName: schedule.podPortName,
    polTerminal: schedule.polTerminal,
    podTerminal: schedule.podTerminal,
    etd: schedule.etd,
    eta: schedule.eta,
    transitTimeDays: schedule.transitTimeDays,
    isDirect: schedule.isDirect,
    isDefaultRoute: schedule.isDefaultRoute,
    transshipmentCount: schedule.transshipmentCount,
    shipmentKind: shipmentKindForSchedule(schedule),
    gateInCutoff: schedule.deadlines.containerGateIn,
    siDocCutoff: schedule.deadlines.siDocClosing,
    vgmCutoff: schedule.deadlines.vgmClosing,
    legs: schedule.legs.map((leg) => ({
      id: leg.id,
      legType: leg.legType,
      vesselName: leg.vesselName,
      vesselCode: leg.vesselCode,
      voyage: leg.voyage,
      bound: leg.bound,
      serviceName: leg.serviceName,
      serviceCode: leg.serviceCode,
      polPortId: leg.polPortId,
      polPortName: leg.polPortName,
      podPortId: leg.podPortId,
      podPortName: leg.podPortName,
      etd: leg.etd,
      eta: leg.eta,
      terminal: leg.terminal,
    })),
  };
}

/**
 * Prefill booking Master Details from a schedule "Book Now" action
 * (list / card / rates drawer).
 */
export function buildMasterDetailsFromSchedule(
  schedule: ScheduleItem,
): MasterDetailsData {
  return {
    origin: portDisplay(schedule.polPortId, schedule.polPortName),
    delivery: portDisplay(schedule.podPortId, schedule.podPortName),
    cargoReadyDate: cargoReadyDateFromSchedule(schedule),
    haulageOriginType: "Merchant",
    haulageDestinationType: "Merchant",
    carriageContract: "",
    onlineBookingNo: "",
    agreementParty: "",
    preferredAgency: "",
    additionalInformation: "",
    selectedRoute: mapScheduleToSelectedRoute(schedule),
    selectedRate: null,
  };
}
