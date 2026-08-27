// Modified by Sekar Nagarajan (2026-08-27 11:30)
import type { SubCustomerAccount, UserProfile } from '@solverminds/auth';
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

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userName: credentials.userName,
      password: hashedPassword,
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: 'Login failed' }))) as {
      message: string;
    };
    throw new Error(err.message ?? 'Invalid Username / Password');
  }

  const json = (await res.json()) as { data: LoginSuccessResponse };
  return json.data;
}

/** POST /api/auth/admin-login — system admin, vendor admin, or impersonation login */
export async function loginAdmin(
  credentials: AdminLoginForm,
  entryType: LoginEntryType,
): Promise<AdminLoginSuccessResponse> {
  const hashedPassword = await hashPassword(credentials.password);

  const res = await fetch('/api/auth/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: credentials.userId,
      password: hashedPassword,
      entryType,
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: 'Login failed' }))) as {
      message: string;
    };
    throw new Error(err.message ?? 'Invalid credentials');
  }

  const json = (await res.json()) as { data: AdminLoginSuccessResponse };
  return json.data;
}

/** GET /api/auth/me — validate token and return current user profile */
export async function fetchCurrentUser(token: string): Promise<UserProfile> {
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Session expired');
  }

  const json = (await res.json()) as { data: { user: UserProfile } };
  return json.data.user;
}

/** GET /api/admin/customers — list all customers for impersonation picker */
export async function fetchCustomerList(): Promise<SubCustomerAccount[]> {
  const token = localStorage.getItem('ecom_auth_token');
  const res = await fetch('/api/admin/customers', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to load customer list');
  }

  const json = (await res.json()) as { data: SubCustomerAccount[] };
  return json.data;
}

/** POST /api/auth/impersonate — switch to a customer context */
export async function impersonateCustomer(custCode: string): Promise<UserProfile> {
  const token = localStorage.getItem('ecom_auth_token');
  const res = await fetch('/api/auth/impersonate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ custCode }),
  });

  if (!res.ok) {
    throw new Error('Failed to switch customer context');
  }

  const json = (await res.json()) as { data: { user: UserProfile } };
  return json.data.user;
}

/** POST /api/auth/exit-impersonation — return to admin context */
export async function exitImpersonation(): Promise<UserProfile> {
  const token = localStorage.getItem('ecom_auth_token');
  const res = await fetch('/api/auth/exit-impersonation', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to exit impersonation');
  }

  const json = (await res.json()) as { data: { user: UserProfile } };
  return json.data.user;
}

/** POST /api/auth/activate — activate user account via token */
export async function activateUser(activationToken: string): Promise<{ message: string }> {
  const res = await fetch('/api/auth/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: activationToken }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: 'Activation failed' }))) as {
      message: string;
    };
    throw new Error(err.message || 'Failed to activate account');
  }

  return (await res.json()) as { message: string };
}

/** POST /api/auth/forgot-password — request a password reset email */
export async function requestPasswordReset(data: { userName: string; captcha: string }): Promise<{ message: string }> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: 'Password reset request failed' }))) as {
      message: string;
    };
    throw new Error(err.message || 'Failed to request password reset');
  }

  return (await res.json()) as { message: string };
}
