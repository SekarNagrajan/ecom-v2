// Created by Sekar Nagarajan (2026-11-13 00:40)
import { describe, expect, it, vi } from "vitest";

import { API_PREFIX, apiPath, resolveApiBaseUrl } from "./paths";

describe("apiPath", () => {
  it("prefixes relative and slash-led paths once", () => {
    expect(apiPath("booking/list")).toBe("/api/v1/booking/list");
    expect(apiPath("/booking/list")).toBe("/api/v1/booking/list");
    expect(apiPath("/api/v1/booking/list")).toBe("/api/v1/booking/list");
    expect(apiPath("")).toBe(API_PREFIX + "/");
  });
});

describe("resolveApiBaseUrl", () => {
  it("stays same-origin in mock mode so MSW can intercept", () => {
    expect(
      resolveApiBaseUrl({ VITE_API_MODE: "mock", VITE_API_URL: "https://api.example.com" }),
    ).toBe("");
  });

  it("uses the host as-is in real mode", () => {
    expect(
      resolveApiBaseUrl({ VITE_API_MODE: "real", VITE_API_URL: "https://api.example.com/" }),
    ).toBe("https://api.example.com");
  });

  it("drops a legacy /api/v1 suffix instead of producing /api/v1/api/…", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(
      resolveApiBaseUrl({ VITE_API_MODE: "real", VITE_API_URL: "http://localhost:8080/api/v1" }),
    ).toBe("http://localhost:8080");
    expect(
      resolveApiBaseUrl({ VITE_API_MODE: "real", VITE_API_URL: "http://localhost:8080/api" }),
    ).toBe("http://localhost:8080");
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });
});
