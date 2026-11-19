import { describe, expect, it } from "vitest";

import {
  customerOptionToPartyCard,
  filterSessionCustomers,
  mergeCustomerOptions,
  partyCardToCustomerOption,
} from "./party-customer.utils";
import { cardsToParties, partiesToCards } from "./party-role.utils";

describe("party-customer.utils", () => {
  it("maps a party card to a customer option with temp code when contact empty", () => {
    const option = partyCardToCustomerOption({
      company: "Acme Logistics",
      contact: "",
      address: "12 Dock Rd",
      city: "Singapore",
      country: "SG",
      email: "ops@acme.test",
      phone: "+65 1111",
    });
    expect(option.customerName).toBe("Acme Logistics");
    expect(option.customerCode.startsWith("NEW-")).toBe(true);
    expect(option.systemCode).toBe("NEW");
    expect(option.address).toBe("12 Dock Rd");
    expect(option.email).toBe("ops@acme.test");
  });

  it("prefers pending card fields when assigning from a new customer", () => {
    const option = partyCardToCustomerOption({
      company: "Acme",
      contact: "ACME01",
      address: "1 Main St",
      city: "Mumbai",
      country: "IN",
      email: "",
      phone: "",
    });
    const pending = {
      company: "Acme",
      contact: "ACME01",
      address: "1 Main St",
      city: "Mumbai",
      country: "IN",
      email: "a@acme.test",
      phone: "999",
    };
    expect(customerOptionToPartyCard(option, pending)).toEqual(pending);
  });

  it("merges session customers into API search results without duplicates", () => {
    const api = [
      {
        customerName: "Existing",
        customerCode: "EX1",
        systemCode: "EX",
        city: "SG",
        country: "SG",
      },
    ];
    const session = [
      {
        customerName: "Existing",
        customerCode: "EX1",
        systemCode: "NEW",
        city: "SG",
        country: "SG",
      },
      {
        customerName: "Brand New Co",
        customerCode: "NEW-1",
        systemCode: "NEW",
        city: "AE",
        country: "AE",
      },
    ];
    expect(mergeCustomerOptions(api, session).map((c) => c.customerCode)).toEqual(["EX1", "NEW-1"]);
    expect(filterSessionCustomers(session, "brand")).toHaveLength(1);
  });

  it("round-trips address fields for agreement / forwarder / notify2 / SI roles", () => {
    const parties = cardsToParties({
      shipper: {
        company: "Shipper Co",
        contact: "S1",
        address: "Ship Addr",
        city: "SG",
        country: "SG",
        email: "s@test",
        phone: "1",
      },
      agreementParty: {
        company: "Agree Co",
        contact: "A1",
        address: "Agree Addr",
        city: "AE",
        country: "AE",
        email: "a@test",
        phone: "2",
      },
      forwarder: {
        company: "Fwd Co",
        contact: "F1",
        address: "Fwd Addr",
        city: "IN",
        country: "IN",
        email: "f@test",
        phone: "3",
      },
      notifyParty2: {
        company: "N2 Co",
        contact: "N2",
        address: "N2 Addr",
        city: "MY",
        country: "MY",
        email: "n2@test",
        phone: "4",
      },
      siSubmittingParty: {
        company: "SI Co",
        contact: "SI1",
        address: "SI Addr",
        city: "TH",
        country: "TH",
        email: "si@test",
        phone: "5",
      },
    });

    const cards = partiesToCards(parties);
    expect(cards.agreementParty?.address).toBe("Agree Addr");
    expect(cards.forwarder?.email).toBe("f@test");
    expect(cards.notifyParty2?.city).toBe("MY");
    expect(cards.siSubmittingParty?.phone).toBe("5");
  });
});
