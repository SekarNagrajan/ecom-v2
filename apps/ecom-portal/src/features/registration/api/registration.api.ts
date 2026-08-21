import { RegistrationFormData } from '../types/registration.schema';

export async function submitRegistration(data: RegistrationFormData): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  
  // Append all top level string/boolean fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && key !== 'kycFile') {
      formData.append(key, value.toString());
    }
  });

  // Append file if it exists
  if (data.kycFile && data.kycFile.originFileObj) {
    formData.append('kycFile', data.kycFile.originFileObj);
  } else if (data.kycFile instanceof File) {
    formData.append('kycFile', data.kycFile);
  }

  const res = await fetch('/api/registration', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Registration submission failed');
  }

  const json = await res.json();
  return json;
}

export async function searchAddress(query: string): Promise<any[]> {
  if (!query) return [];
  const res = await fetch(`/api/address-lookup?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

export async function checkCustomerCode(code: string): Promise<any> {
  const res = await fetch(`/api/check-company?code=${encodeURIComponent(code)}`);
  if (!res.ok) {
    throw new Error('Customer code check failed');
  }
  return res.json();
}

export async function checkEmail(email: string): Promise<{ available: boolean }> {
  const res = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
  if (!res.ok) {
    throw new Error('Email check failed');
  }
  return res.json();
}
