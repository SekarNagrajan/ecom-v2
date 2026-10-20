// Modified by Sekar Nagarajan (2026-10-20 16:50)
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ASSISTANT_ROOT = path.dirname(fileURLToPath(import.meta.url));

/**
 * Phase 3: submit is allowed ONLY via submit-booking.action.ts
 * (called from AutomationConfirmCard after explicit confirm).
 */
const ALLOWED_SUBMIT_FILES = new Set([
  "actions/submit-booking.action.ts",
  "components/cards/AutomationConfirmCard.tsx",
]);

const FORBIDDEN = [
  /submitBooking\b/,
  /bookingApi\.submit/,
  /useSubmitBooking/,
  /submitBookingMutation/,
  /["']\/api\/booking\/submit["']/,
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(ts|tsx)$/.test(name) && !name.includes(".test.")) {
      out.push(full);
    }
  }
  return out;
}

describe("assistant booking submit boundary", () => {
  it("only allowlisted files may call booking submit", () => {
    const files = walk(ASSISTANT_ROOT);
    const violations: string[] = [];
    for (const file of files) {
      const rel = path.relative(ASSISTANT_ROOT, file).replace(/\\/g, "/");
      if (ALLOWED_SUBMIT_FILES.has(rel)) continue;
      const source = readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN) {
        if (pattern.test(source)) {
          violations.push(`${rel} matches ${pattern}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
