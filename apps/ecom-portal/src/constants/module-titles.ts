// Modified by Sekar Nagarajan (2026-08-26 16:00)
/** Title Case module screen names — aligned with sidebar nomenclature (ApplicationResource_en.properties). */
export const MODULE_TITLES = {
  dashboard: 'Dashboard',
  schedules: 'Schedules',
  tracking: 'Tracking',
  rates: 'Rates',
  tariff: 'Tariff',
  booking: 'Booking',
  newBooking: 'New Booking',
  amendBooking: 'Amend Booking',
  viewBooking: 'View Booking',
  shippingInstruction: 'Shipping Instruction',
  shippingInstructions: 'Shipping Instructions',
  shippingInstructionSummary: 'Shipping Instruction Summary',
  vgm: 'VGM Declaration',
  billOfLading: 'Bill of Lading',
  billOfLadingSummary: 'Bill of Lading Summary',
  deliveryOrder: 'Delivery Order',
  arrivalNotice: 'Arrival Notice',
  containerReleaseOrder: 'Container Release Order',
  userCreation: 'User Creation',
  agencyApprovals: 'Agency Approvals',
  paymentHistory: 'Payment History',
  customerStatement: 'Customer Statement',
  carbonCalculator: 'Carbon Calculator',
  contactUs: 'Contact Us',
  quotes: 'Quote (Rate Request)',
  myAlerts: 'My Alerts',
  profile: 'Profile',
  changePassword: 'Change Password',
  admin: 'Control Panel Admin',
} as const;

export const WIZARD_STEP_TITLES = {
  masterDetails: 'Master Details',
  customerDetails: 'Customer Details',
  cargoDetails: 'Cargo Details',
  ensDetails: 'ENS Details',
  insurance: 'Insurance',
  fileUpload: 'File Upload',
  preview: 'Preview',
  parties: 'Parties',
  charges: 'Charges',
} as const;

export function formatModuleScreenTitle(base: string, detail?: string | null): string {
  const trimmed = detail?.trim();
  if (!trimmed) {
    return base;
  }
  return `${base}: ${trimmed}`;
}
