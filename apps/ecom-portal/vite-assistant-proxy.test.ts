// Modified by Sekar Nagarajan (2026-10-20 13:05)
import { describe, expect, it } from "vitest";

import {
  resolveAssistantBaseUrl,
  stripAssistantPrefix,
} from "./vite-assistant-proxy";

describe("ecom assistant proxy contract", () => {
  it("strips /api/assistant prefix for chat", () => {
    expect(stripAssistantPrefix("/api/assistant/v1/chat")).toBe("/v1/chat");
  });

  it("preserves query string after strip", () => {
    expect(stripAssistantPrefix("/api/assistant/v1/conversations/abc?x=1")).toBe(
      "/v1/conversations/abc?x=1",
    );
  });

  it("resolves base URL from AI_ASSISTANT_BASE_URL first", () => {
    expect(
      resolveAssistantBaseUrl({
        AI_ASSISTANT_BASE_URL: "http://ai.example:9000/",
        ECOM_AI_SERVICE_URL: "http://ignored:8000",
      }),
    ).toBe("http://ai.example:9000");
  });

  it("falls back to ECOM_AI_SERVICE_URL then localhost:8000", () => {
    expect(
      resolveAssistantBaseUrl({
        ECOM_AI_SERVICE_URL: "http://svc:8000",
      }),
    ).toBe("http://svc:8000");
    expect(resolveAssistantBaseUrl({})).toBe("http://localhost:8000");
  });
});
