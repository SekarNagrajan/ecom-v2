import type { LoginForm, LoginSuccessResponse } from '../types/auth.types';

/** POST /api/auth/login — returns session data on success, throws on failure. */
export async function loginUser(credentials: LoginForm): Promise<LoginSuccessResponse> {
  // SHA-256 hash password before transmission — parity with JSP sha256() function
  const msgBuffer = new TextEncoder().encode(credentials.password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = new Uint8Array(hashBuffer);
  let binary = '';
  hashArray.forEach((byte) => (binary += String.fromCharCode(byte)));
  const hashedPassword = btoa(binary);

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

/** POST /api/auth/activate — activate user account via token */
export async function activateUser(token: string): Promise<{ message: string }> {
  const res = await fetch('/api/auth/activate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: 'Activation failed' }))) as {
      message: string;
    };
    throw new Error(err.message || 'Failed to activate account');
  }

  return (await res.json()) as { message: string };
}
