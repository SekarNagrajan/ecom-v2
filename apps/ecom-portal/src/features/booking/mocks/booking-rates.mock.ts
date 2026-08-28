// Created by Sekar Nagarajan (2026-08-27 19:12)
/** Mock available rates for Master step rate picker. */

export interface BookingRateOption {
  rateNo: string;
  itemNo: string;
  amdNo: string;
  rateType: string;
  eqpType: string;
  amount: number;
  currency: string;
  customer: string;
  customerCode: string;
}

export function buildMockBookingRates(params: {
  origin: string;
  delivery: string;
}): BookingRateOption[] {
  const lane = `${params.origin || "POL"}→${params.delivery || "POD"}`;
  return [
    {
      rateNo: "RT-2026-1001",
      itemNo: "1",
      amdNo: "0",
      rateType: "CMS",
      eqpType: "40HC",
      amount: 1850,
      currency: "USD",
      customer: "SolverMinds Solutions",
      customerCode: "INSVM001",
    },
    {
      rateNo: "RT-2026-1002",
      itemNo: "2",
      amdNo: "1",
      rateType: "CRA",
      eqpType: "20DV",
      amount: 980,
      currency: "USD",
      customer: "SA GLOBAL BUSINESS LTD.",
      customerCode: "AEJEA20170000532",
    },
    {
      rateNo: "RT-2026-1003",
      itemNo: "1",
      amdNo: "0",
      rateType: "CMS",
      eqpType: "40RH",
      amount: 2400,
      currency: "USD",
      customer: lane.slice(0, 24),
      customerCode: "GEN",
    },
  ];
}
