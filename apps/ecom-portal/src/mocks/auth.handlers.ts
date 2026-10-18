// Modified by Sekar Nagarajan (2026-10-16 23:35)
import { delay, http, HttpResponse } from "msw";
import type { LoginForm, LoginSuccessResponse } from "../features/auth/types/auth.types";
import { registerMockToken } from "./auth-token-registry";
import {
  activateUser,
  buildCustomerProfile,
  customerToken,
  DEMO_BASELINE_CAPABILITIES,
  resetUserPassword,
  resolveCustomerLogin,
} from "./fixture-api/bridges/users.bridge";

/**
 * Customer auth served from the SQL-extracted fixtures:
 * - `test` / `test` → the first ecomuserdetails row of customer 20001374 (joined to eCom_Reg_Details);
 *   its capabilities are unioned with DEMO_BASELINE_CAPABILITIES so every demo route stays reachable.
 * - any other fixture `users.loginname` (or User_Email) with ANY non-empty password → that user, with the
 *   capabilities its MenuId grants (see REFNO_TO_CAPABILITY in fixture-api/bridges/menus.bridge.ts).
 * - unknown login → 401 with the same body as before.
 * NOTE: src/mocks/landing.handlers.ts also registers POST /api/auth/login and is listed before this file
 * in browser.ts, so in the browser its pattern-matching login currently answers first.
 */
export const authHandlers = [
  // 1. Login
  http.post("/api/auth/login", async ({ request }) => {
    await delay(800); // Simulate network latency

    const body = (await request.json()) as LoginForm;
    const resolved = body.password ? resolveCustomerLogin(body.userName) : null;
    if (resolved && (resolved.demo ? body.password === "test" || body.password.length > 0 : true)) {
      const user = buildCustomerProfile(resolved.user, resolved.details, resolved.demo ? DEMO_BASELINE_CAPABILITIES : []);
      const successResponse: LoginSuccessResponse = { token: customerToken(resolved.user), user };
      registerMockToken(successResponse.token, user);
      return HttpResponse.json({ data: successResponse });
    }

    // Invalid credentials
    return HttpResponse.json(
      { message: "Invalid username or password. Please try again." },
      { status: 401 },
    );
  }),

  // 2. Activation — the token is the registration e-mail / reg_no; a known user is marked valid in-session
  http.post("/api/auth/activate", async ({ request }) => {
    await delay(1500); // Simulate network latency

    const body = (await request.json()) as { token: string };

    if (!body.token || body.token === "invalid") {
      return HttpResponse.json(
        { message: "Invalid or expired activation link." },
        { status: 400 },
      );
    }

    activateUser(body.token);
    return HttpResponse.json({
      message: "Account successfully activated!",
      status: "success",
    });
  }),

  // 3. Forgot password — resets the lock counters of a known login; unknown logins get the same answer (no enumeration)
  http.post("/api/auth/forgot-password", async ({ request }) => {
    await delay(1200); // Simulate network latency

    const body = (await request.json()) as { userName: string; captcha: string };

    if (!body.userName || !body.captcha) {
      return HttpResponse.json(
        { message: "Username and captcha are required." },
        { status: 400 },
      );
    }

    resetUserPassword(body.userName);
    return HttpResponse.json({
      message: "Password reset instructions have been sent to your registered email.",
      status: "success",
    });
  }),
];
