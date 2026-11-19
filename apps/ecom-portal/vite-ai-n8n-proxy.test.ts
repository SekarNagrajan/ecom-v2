// Created by Sekar Nagarajan (2026-10-19)
import { describe, expect, it } from "vitest";

/**
 * Lightweight contract checks for the rewrite stub shape used when n8n
 * /rewrite is unavailable. Mirrors vite-ai-n8n-proxy buildRewriteStub output.
 */
function buildRewriteStubJson(body: {
  content_html?: string;
  action?: string;
}) {
  const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const plain = stripHtml(body.content_html ?? "");
  const action = body.action ?? "professional";
  const rewritten = plain
    ? `[${action}] ${plain.charAt(0).toUpperCase()}${plain.slice(1)}${/[.!?]$/.test(plain) ? "" : "."}`
    : "Thank you for your inquiry. We look forward to supporting your shipment.";
  return {
    ok: true as const,
    rewritten_html: `<p>${escapeHtml(rewritten)}</p>`,
    stub: true as const,
  };
}

describe("ecom AI rewrite stub contract", () => {
  it("returns ok + rewritten_html for HTML content and action", () => {
    const result = buildRewriteStubJson({
      content_html: "<p>please confirm shipment</p>",
      action: "friendly",
    });
    expect(result.ok).toBe(true);
    expect(result.stub).toBe(true);
    expect(result.rewritten_html).toContain("[friendly]");
    expect(result.rewritten_html).toContain("Please confirm shipment");
  });

  it("returns a default paragraph when content is empty", () => {
    const result = buildRewriteStubJson({ content_html: "<p></p>" });
    expect(result.ok).toBe(true);
    expect(result.rewritten_html.startsWith("<p>")).toBe(true);
    expect(result.rewritten_html).toContain("Thank you for your inquiry");
  });
});
