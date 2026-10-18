// Modified by Sekar Nagarajan (2026-10-18 10:25)
import dayjs from "dayjs";
import { describe, expect, it } from "vitest";

import {
  buildRatesSearchParams,
  buildScheduleSearchParams,
  buildTrackingSearchParams,
  equipmentLabelOf,
  pickPortByCode,
  portCodeOf,
} from "./landing-search";

const today = dayjs("2026-10-18");

describe("landing search helpers", () => {
  it("extracts port codes from typeahead labels with a default lane fallback", () => {
    expect(portCodeOf("INNSA - NHAVA SHEVA,MUMBAI", "X")).toBe("INNSA");
    expect(portCodeOf(" aejea ", "X")).toBe("AEJEA");
    expect(portCodeOf("", "SGSIN")).toBe("SGSIN");
  });

  it("builds the schedules deep link with a 14-day window that never ends before it starts", () => {
    expect(buildScheduleSearchParams({}, today)).toEqual({
      pol: "INNSA", pod: "AEJEA", fromDate: "2026-10-18", toDate: "2026-11-01", schetype: "loginschedule",
    });
    expect(buildScheduleSearchParams({ pol: "CNSHA - SHANGHAI", pod: "AEJEA - JEBEL ALI, UAE", fromDate: "2026-11-05", toDate: "2026-11-01" }, today))
      .toMatchObject({ pol: "CNSHA", pod: "AEJEA", fromDate: "2026-11-05", toDate: "2026-11-05" });
  });

  it("builds the tracking deep link with the reference upper-cased", () => {
    expect(buildTrackingSearchParams({ searchType: "BOOKING", trackingNumber: " svmdmu2694105 " })).toEqual({
      trackingNumber: "SVMDMU2694105", logintracno: "SVMDMU2694105", searchType: "BOOKING", tracktype: "logintracking",
    });
  });

  it("builds the rates deep link with the equipment master code and a shipment date", () => {
    expect(buildRatesSearchParams({}, today)).toEqual({
      pol: "INNSA", pod: "AEJEA", ratepol: "INNSA", ratepod: "AEJEA", eqpType: "20DC", rateseqp: "20DC",
      shipmentdate: "2026-10-25", loginratetype: "loginratetype",
    });
    expect(buildRatesSearchParams({ pol: "INNSA - X", pod: "SGSIN - Y", equipmentType: "40HC", shipmentDate: "2026-12-01" }, today))
      .toMatchObject({ pod: "SGSIN", eqpType: "40HC", shipmentdate: "2026-12-01" });
  });

  it("labels equipment with its code and picks ports by exact code", () => {
    expect(equipmentLabelOf({ code: "20DC", name: "STANDARD 20DC CONTAINER" })).toBe("20DC - STANDARD 20DC CONTAINER");
    expect(equipmentLabelOf({ code: "20DC", name: "20DC" })).toBe("20DC");
    const ports = [
      { portCode: "INNSAX", portName: "Other", label: "INNSAX - Other" },
      { portCode: "INNSA", portName: "NHAVA SHEVA,MUMBAI", label: "INNSA - NHAVA SHEVA,MUMBAI" },
    ];
    expect(pickPortByCode(ports, "innsa")?.portName).toBe("NHAVA SHEVA,MUMBAI");
    expect(pickPortByCode(ports, "ZZZZZ")).toBeUndefined();
  });
});
