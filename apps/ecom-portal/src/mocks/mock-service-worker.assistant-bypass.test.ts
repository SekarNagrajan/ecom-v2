// Modified by Sekar Nagarajan (2026-10-20 22:15)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Guards the permanent SSE fix: after `npx msw init`, someone must re-apply
 * the /api/assistant early-return in public/mockServiceWorker.js.
 */
describe("mockServiceWorker assistant SSE bypass", () => {
  it("skips respondWith for /api/assistant paths", () => {
    const sw = readFileSync(
      resolve(__dirname, "../../public/mockServiceWorker.js"),
      "utf8",
    );
    expect(sw).toContain("/api/assistant");
    expect(sw).toContain("pathname.startsWith('/api/assistant/')");
    // Early return without respondWith — not fetch(passthrough).
    expect(sw).toMatch(
      /if \(pathname === '\/api\/assistant'[\s\S]*?\{\s*return\s*\}/,
    );
  });
});
