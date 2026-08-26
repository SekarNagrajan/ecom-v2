// Modified by Sekar Nagarajan (2026-08-25 16:15)
import type {
  AddressLookupResult,
  CustomerCodeCheckResult,
  EmailCheckResult,
  RegistrationFormData,
  RegistrationSubmitResult,
} from "../types/registration.schema";

function isUploadFileLike(
  value: unknown
): value is { originFileObj?: File } {
  return typeof value === "object" && value !== null;
}

export async function submitRegistration(
  data: RegistrationFormData
): Promise<RegistrationSubmitResult> {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && key !== "kycFile") {
      formData.append(key, String(value));
    }
  });

  const kyc = data.kycFile;
  if (kyc instanceof File) {
    formData.append("kycFile", kyc);
  } else if (isUploadFileLike(kyc) && kyc.originFileObj instanceof File) {
    formData.append("kycFile", kyc.originFileObj);
  }

  const res = await fetch("/api/registration", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(errorData.message || "Registration submission failed");
  }

  return (await res.json()) as RegistrationSubmitResult;
}

export async function searchAddress(
  query: string
): Promise<AddressLookupResult[]> {
  if (!query) return [];
  const res = await fetch(
    `/api/address-lookup?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: AddressLookupResult[] };
  return data.results ?? [];
}

export async function checkCustomerCode(
  code: string
): Promise<CustomerCodeCheckResult> {
  const res = await fetch(
    `/api/check-company?code=${encodeURIComponent(code)}`
  );
  if (!res.ok) {
    throw new Error("Customer code check failed");
  }
  return (await res.json()) as CustomerCodeCheckResult;
}

export async function checkEmail(email: string): Promise<EmailCheckResult> {
  const res = await fetch(
    `/api/check-email?email=${encodeURIComponent(email)}`
  );
  if (!res.ok) {
    throw new Error("Email check failed");
  }
  return (await res.json()) as EmailCheckResult;
}
