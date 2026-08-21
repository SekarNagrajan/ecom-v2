import { LicenseManager } from 'ag-grid-enterprise';

let isAgGridLicenseInitialized = false;

export const initAgGridLicense = (licenseKey?: string) => {
  if (isAgGridLicenseInitialized) return;

  const normalizedLicenseKey = licenseKey?.trim();
  if (!normalizedLicenseKey) return;

  LicenseManager.setLicenseKey(normalizedLicenseKey);
  isAgGridLicenseInitialized = true;
};
