// Created by Sekar Nagarajan (2026-08-27 19:12)
/** Mock customer directory for booking party search. */

export interface BookingCustomerOption {
  customerName: string;
  customerCode: string;
  systemCode: string;
  city: string;
  country: string;
  email?: string;
  phone?: string;
}

export const BOOKING_CUSTOMERS: BookingCustomerOption[] = [
  {
    customerName: "SA GLOBAL BUSINESS LTD.",
    customerCode: "AEJEA20170000532",
    systemCode: "20170000532",
    city: "Ajman",
    country: "AE",
    email: "ops@saglobal.ae",
    phone: "+971 6 123 4567",
  },
  {
    customerName: "SAIKUMAR VEERAVALLI",
    customerCode: "20170000569",
    systemCode: "20170000569",
    city: "Hyderabad",
    country: "IN",
  },
  {
    customerName: "SolverMinds Solutions Pvt. Ltd.",
    customerCode: "INSVM001",
    systemCode: "INSVM001",
    city: "Chennai",
    country: "IN",
    email: "booking@solverminds.com",
    phone: "+91 44 4000 1000",
  },
  {
    customerName: "Maritime Freight Forwarders LLC",
    customerCode: "AEJEA-MFF",
    systemCode: "AEJEA-MFF",
    city: "Dubai",
    country: "AE",
    email: "sarah@maritimefreight.ae",
    phone: "+971 4 987 6543",
  },
  {
    customerName: "Singapore Marine Traders Pte.",
    customerCode: "SGSIN-SMT",
    systemCode: "SGSIN-SMT",
    city: "Singapore",
    country: "SG",
  },
  {
    customerName: "Gulf Trading FZE",
    customerCode: "AEJEA-GTF",
    systemCode: "AEJEA-GTF",
    city: "Jebel Ali",
    country: "AE",
  },
  {
    customerName: "SAMPLE CUSTOMER",
    customerCode: "INSVM387",
    systemCode: "INSVM387",
    city: "Chennai",
    country: "IN",
  },
];

export function searchBookingCustomers(query: string): BookingCustomerOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return BOOKING_CUSTOMERS.filter(
    (c) =>
      c.customerName.toLowerCase().includes(q) ||
      c.customerCode.toLowerCase().includes(q) ||
      c.systemCode.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q),
  );
}
