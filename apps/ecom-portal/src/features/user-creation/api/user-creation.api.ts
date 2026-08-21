// Modified by sekar nagarajan (2026-08-21)
import type { CreateSubUserPayload, SubUser, UserLimitResponse } from '../types/user-creation.types';

export const userCreationApi = {
  async getSubUsers(): Promise<SubUser[]> {
    const res = await fetch('/api/v1/user-creation/sub-users');
    if (!res.ok) throw new Error('Failed to fetch sub-users');
    return res.json();
  },

  async getUserLimit(): Promise<UserLimitResponse> {
    const res = await fetch('/api/v1/user-creation/limit');
    if (!res.ok) throw new Error('Failed to fetch user limits');
    return res.json();
  },

  async createSubUser(payload: CreateSubUserPayload): Promise<{ success: boolean; message: string; subUser: SubUser }> {
    const res = await fetch('/api/v1/user-creation/sub-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to create sub-user profile');
    }
    return data;
  },

  async toggleSubUserStatus(id: string, active: boolean): Promise<SubUser> {
    const res = await fetch(`/api/v1/user-creation/sub-users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    if (!res.ok) throw new Error('Failed to update user status');
    return res.json();
  },
};
