// Created by Sekar Nagarajan (2026-09-28 15:22)

/** Single agency hotline contact — parity with HotlineContactsVO. */
export interface HotlineContact {
  portName: string;
  contactName: string;
  phone: string;
  email: string;
}

/** Country group — TreeMap key in legacy getHotlineContacts(). */
export interface HotlineCountryGroup {
  countryName: string;
  ports: HotlineContact[];
}

export interface HotlineContactsResponse {
  countries: HotlineCountryGroup[];
}
