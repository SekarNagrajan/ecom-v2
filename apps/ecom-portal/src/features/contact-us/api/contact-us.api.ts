// Modified by sekar nagarajan (2026-08-21)
import type { ContactUsFormData } from '../types/contact-us.schema';

interface ContactUsResponse {
  success: boolean;
  message: string;
}

/**
 * Submit the Contact Us form to the backend.
 * Legacy endpoint: Contactus.do (Struts action)
 * New endpoint: POST /api/contact-us
 */
export async function submitContactUs(data: ContactUsFormData): Promise<ContactUsResponse> {
  const response = await fetch('/api/contact-us', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Failed to send message');
  }

  return response.json();
}
