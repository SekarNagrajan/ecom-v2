// Created by Sekar Nagarajan (2026-08-26 14:26)
import type { DOSummaryRow } from "../types/delivery-order.types";

/** In-memory seed — MSW handlers + mock API share this source. */
export const MOCK_DO_LIST: DOSummaryRow[] = [
  {
    delordno: "DO0007742",
    delorddate: "2026-08-18T00:00:00",
    blnumber: "ESLSIN123456",
    vessel: "MSC ELARA",
    voyage: "EL042N",
    bound: "N",
    loadport: "SGSIN - Singapore",
    dischargeport: "INNSA - Nhava Sheva",
    terminal: "NSICT",
    arrdate: "2026-08-22T00:00:00",
    dovaliditydate: "2026-08-29T00:00:00",
    printstatus: "N",
    ecomprintstatus: "1",
  },
  {
    delordno: "DO0007743",
    delorddate: "2026-08-19T00:00:00",
    blnumber: "ESLSIN123457",
    vessel: "EVER GIVEN",
    voyage: "EV001E",
    bound: "N",
    loadport: "CNSHG - Shanghai",
    dischargeport: "USLAX - Los Angeles",
    terminal: "APM",
    arrdate: "2026-08-24T00:00:00",
    dovaliditydate: "2026-08-31T00:00:00",
    printstatus: "Y",
    ecomprintstatus: "1",
  },
  {
    delordno: "DO0007744",
    delorddate: "2026-08-20T00:00:00",
    blnumber: "ESLSIN123458",
    vessel: "ONE HONOLULU",
    voyage: "OH118W",
    bound: "W",
    loadport: "KRPUS - Busan",
    dischargeport: "INMAA - Chennai",
    terminal: "CITPL",
    arrdate: "2026-08-26T00:00:00",
    dovaliditydate: "2026-09-02T00:00:00",
    printstatus: "N",
    ecomprintstatus: "1",
  },
];

/** Mutable print-status store for mock download side effects. */
export let mockDeliveryOrders: DOSummaryRow[] = MOCK_DO_LIST.map((row) => ({
  ...row,
}));

export function resetMockDeliveryOrders() {
  mockDeliveryOrders = MOCK_DO_LIST.map((row) => ({ ...row }));
}

export function markDoPrinted(delOrdNo: string) {
  const idx = mockDeliveryOrders.findIndex((d) => d.delordno === delOrdNo);
  if (idx === -1) return;
  const row = mockDeliveryOrders[idx];
  if (row.printstatus === "N" && row.ecomprintstatus === "1") {
    mockDeliveryOrders[idx] = { ...row, printstatus: "Y" };
  }
}
