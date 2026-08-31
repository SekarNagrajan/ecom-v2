// Modified by Sekar Nagarajan (2026-08-25 13:00)
import { http, delay, HttpResponse } from 'msw';
import { LoginForm, LoginSuccessResponse } from '../features/auth/types/auth.types';

export const authHandlers = [
  // 1. Mock Login API
  http.post('/api/auth/login', async ({ request }) => {
    await delay(800); // Simulate network latency

    const body = (await request.json()) as LoginForm;

    // Enforce test credentials: test / test
    if (body.userName === 'test' && body.password === 'test') {
      const successResponse: LoginSuccessResponse = {
        token: 'mock-jwt-token-xyz-123',
        user: {
          id: 'user_123',
          name: 'Test User',
          email: 'test@example.com',
          company: 'Test Company',
          role: 'CUSTOMER',
          // Modified by Sekar Nagarajan (2026-08-31 17:03) — include DO so Delivery Order route is reachable
          capabilities: ['VIEW_DASHBOARD', 'CREATE_BOOKING', 'BL', 'SI', 'BKG', 'DO', 'CRO', 'ARN', 'STMT', 'CO2', 'VGM'],
        },
      };

      return HttpResponse.json({ data: successResponse });
    }

    // Invalid credentials
    return HttpResponse.json(
      { message: 'Invalid username or password. Please try again.' },
      { status: 401 }
    );
  }),

  // 2. Mock Activation API
  http.post('/api/auth/activate', async ({ request }) => {
    await delay(1500); // Simulate network latency

    const body = (await request.json()) as { token: string };

    // Simple validation: Any token that isn't 'invalid' or empty works
    if (!body.token || body.token === 'invalid') {
      return HttpResponse.json(
        { message: 'Invalid or expired activation link.' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      message: 'Account successfully activated!',
      status: 'success'
    });
  }),

  // 3. Mock Forgot Password API
  http.post('/api/auth/forgot-password', async ({ request }) => {
    await delay(1200); // Simulate network latency

    const body = (await request.json()) as { userName: string; captcha: string };

    // Simple validation
    if (!body.userName || !body.captcha) {
      return HttpResponse.json(
        { message: 'Username and captcha are required.' },
        { status: 400 }
      );
    }

    if (body.captcha.toLowerCase() !== 'abcd') {
      // Allow any captcha for test purposes, except if it's strictly empty or invalid in a specific way.
      // We'll just accept anything for the mock unless we want to enforce 'abcd'. Let's accept anything.
    }

    return HttpResponse.json({
      message: 'Password reset instructions have been sent to your registered email.',
      status: 'success'
    });
  }),
];
