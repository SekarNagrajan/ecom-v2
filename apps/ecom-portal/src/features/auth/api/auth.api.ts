// Modified by Sekar Nagarajan (2026-09-07 17:24)
import type { SubCustomerAccount, UserProfile } from '@solverminds/auth';
import { apiClient, extractApiError } from '@solverminds/platform';

import type {
  AdminLoginForm,
  AdminLoginSuccessResponse,
  LoginEntryType,
  LoginForm,
  LoginSuccessResponse,
} from '../types/auth.types';

async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = new Uint8Array(hashBuffer);
  let binary = '';
  hashArray.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

/** POST /api/auth/login — customer login */
export async function loginUser(credentials: LoginForm): Promise<LoginSuccessResponse> {
  const hashedPassword = await hashPassword(credentials.password);

  try {
    const response = await apiClient.post<{ data: LoginSuccessResponse }>(
      '/api/auth/login',
      {
        userName: credentials.userName,
        password: hashedPassword,
      },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(extractApiError(error) || 'Invalid Username / Password');
  }
}

/** POST /api/auth/admin-login — system admin, vendor admin, or impersonation login */
export async function loginAdmin(
  credentials: AdminLoginForm,
  entryType: LoginEntryType,
): Promise<AdminLoginSuccessResponse> {
  const hashedPassword = await hashPassword(credentials.password);

  try {
    const response = await apiClient.post<{ data: AdminLoginSuccessResponse }>(
      '/api/auth/admin-login',
      {
        userId: credentials.userId,
        password: hashedPassword,
        entryType,
      },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(extractApiError(error) || 'Invalid credentials');
  }
}

/** GET /api/auth/me — validate token and return current user profile */
export async function fetchCurrentUser(token: string): Promise<UserProfile> {
  try {
    const response = await apiClient.get<{ data: { user: UserProfile } }>(
      '/api/auth/me',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data.data.user;
  } catch {
    throw new Error('Session expired');
  }
}

/** GET /api/admin/customers — list all customers for impersonation picker */
export async function fetchCustomerList(): Promise<SubCustomerAccount[]> {
  try {
    const response = await apiClient.get<{ data: SubCustomerAccount[] }>(
      '/api/admin/customers',
    );
    return response.data.data;
  } catch {
    throw new Error('Failed to load customer list');
  }
}

/** POST /api/auth/impersonate — switch to a customer context */
export async function impersonateCustomer(custCode: string): Promise<UserProfile> {
  try {
    const response = await apiClient.post<{ data: { user: UserProfile } }>(
      '/api/auth/impersonate',
      { custCode },
    );
    return response.data.data.user;
  } catch {
    throw new Error('Failed to switch customer context');
  }
}

/** POST /api/auth/exit-impersonation — return to admin context */
export async function exitImpersonation(): Promise<UserProfile> {
  try {
    const response = await apiClient.post<{ data: { user: UserProfile } }>(
      '/api/auth/exit-impersonation',
    );
    return response.data.data.user;
  } catch {
    throw new Error('Failed to exit impersonation');
  }
}

/** POST /api/auth/activate — activate user account via token */
export async function activateUser(activationToken: string): Promise<{ message: string }> {
  try {
    const response = await apiClient.post<{ message: string }>(
      '/api/auth/activate',
      { token: activationToken },
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error) || 'Failed to activate account');
  }
}

/** POST /api/auth/forgot-password — request a password reset email */
export async function requestPasswordReset(data: {
  userName: string;
  captcha: string;
}): Promise<{ message: string }> {
  try {
    const response = await apiClient.post<{ message: string }>(
      '/api/auth/forgot-password',
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error) || 'Failed to request password reset');
  }
}
