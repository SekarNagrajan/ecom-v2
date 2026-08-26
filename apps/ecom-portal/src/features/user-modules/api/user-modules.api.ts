// Modified by Sekar Nagarajan (2026-08-26 16:00)
import type {
  AlertHistoryLog,
  AlertPreference,
  ChangePasswordPayload,
  CreateQuoteRequestPayload,
  CustomerProfile,
  PaymentHistoryRecord,
  QuoteItem,
} from '../types/user-modules.types';

export const userModulesApi = {
  // 1. Profile
  async getProfile(): Promise<CustomerProfile> {
    const res = await fetch('/api/v1/user/profile');
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  async updateProfile(payload: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const res = await fetch('/api/v1/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update user profile');
    return res.json();
  },

  // 2. Change Password
  async changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/v1/user/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update password');
    }
    return data;
  },

  // 3. Quotes / Rate Requests
  async getQuotes(): Promise<QuoteItem[]> {
    const res = await fetch('/api/v1/user/quotes');
    if (!res.ok) throw new Error('Failed to fetch rate quotes');
    return res.json();
  },

  async createQuoteRequest(payload: CreateQuoteRequestPayload): Promise<QuoteItem> {
    const res = await fetch('/api/v1/user/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit rate quotation request');
    return res.json();
  },

  // 4. Alert Preferences & History
  async getAlertPreferences(): Promise<AlertPreference> {
    const res = await fetch('/api/v1/user/alerts/preferences');
    if (!res.ok) throw new Error('Failed to fetch alert preferences');
    return res.json();
  },

  async updateAlertPreferences(payload: AlertPreference): Promise<AlertPreference> {
    const res = await fetch('/api/v1/user/alerts/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update alert preferences');
    return res.json();
  },

  async getAlertLogs(): Promise<AlertHistoryLog[]> {
    const res = await fetch('/api/v1/user/alerts/logs');
    if (!res.ok) throw new Error('Failed to fetch alert logs');
    return res.json();
  },

  // 5. Payment History
  async getPaymentHistory(): Promise<PaymentHistoryRecord[]> {
    const res = await fetch('/api/v1/user/payments');
    if (!res.ok) throw new Error('Failed to fetch payment history');
    return res.json();
  },
};
