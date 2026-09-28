// Created by Sekar Nagarajan (2026-09-28 15:22)
import type { HotlineContactsResponse } from "../types/hotline.types";

/** Sample country → port contacts matching HotlineContactsVO shape. */
export const MOCK_HOTLINE_CONTACTS: HotlineContactsResponse = {
  countries: [
    {
      countryName: "Malaysia",
      ports: [
        {
          portName: "Port Klang",
          contactName: "Jane Smith",
          phone: "+60 3 1234 5678",
          email: "my.support@solverminds.com",
        },
      ],
    },
    {
      countryName: "Netherlands",
      ports: [
        {
          portName: "Rotterdam",
          contactName: "Jan de Vries",
          phone: "+31 10 123 4567",
          email: "nl.support@solverminds.com",
        },
      ],
    },
    {
      countryName: "Singapore",
      ports: [
        {
          portName: "Singapore",
          contactName: "John Doe",
          phone: "+65 1234 5678",
          email: "sg.support@solverminds.com",
        },
      ],
    },
    {
      countryName: "United Arab Emirates",
      ports: [
        {
          portName: "Dubai",
          contactName: "Ahmed Hassan",
          phone: "+971 4 123 4567",
          email: "ae.support@solverminds.com",
        },
        {
          portName: "Jebel Ali",
          contactName: "Sara Al Maktoum",
          phone: "+971 4 765 4321",
          email: "ae.jebel@solverminds.com",
        },
      ],
    },
  ],
};
