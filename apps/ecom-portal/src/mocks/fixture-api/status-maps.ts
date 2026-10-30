// Created by Sekar Nagarajan (2026-10-16 22:31)
/**
 * Status code → label maps for the fixture tables. The codes come from the EJB queries;
 * adjust the labels to the wording the screens use. Unknown codes fall back to the raw code.
 * Kept free of MSW imports so the bridges and unit tests can use them directly.
 */
export const BOOKING_STATUS: Record<string, string> = {
  D: 'Draft',
  S: 'Submitted',
  C: 'Confirmed',
  A: 'Accepted',
  P: 'Pending with agency',
  V: 'Declined',
  I: 'Cancelled',
  T: 'Template',
  M: 'Amendment requested',
};

export const SI_STATUS: Record<string, string> = {
  D: 'Draft',
  S: 'Submitted',
  A: 'Accepted',
  C: 'Confirmed',
  V: 'Declined',
  I: 'Cancelled',
};

export const VGM_STATUS: Record<string, string> = {
  A: 'Active',
  C: 'Confirmed',
  I: 'Inactive',
  P: 'Pending',
};

export const label = (map: Record<string, string>, code: unknown) => map[String(code ?? '')] ?? String(code ?? '');
