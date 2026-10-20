// Modified by Sekar Nagarajan (2026-10-20 14:14)
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to} data-testid="router-link">
      {children}
    </a>
  ),
}));

import { MessageMarkdown } from "./MessageMarkdown";

describe("MessageMarkdown", () => {
  it("escapes raw HTML script tags as text", () => {
    render(<MessageMarkdown text={'Hello <script>alert(1)</script>'} />);
    expect(screen.getByText(/script/i)).toBeTruthy();
    expect(document.querySelector("script")).toBeNull();
  });

  it("renders internal /app/ links via the router Link", () => {
    render(<MessageMarkdown text={"See [Booking](/app/booking)"} />);
    const link = screen.getByTestId("router-link");
    expect(link.getAttribute("href")).toBe("/app/booking");
  });

  it("wraps GFM tables in a horizontal-scroll container", () => {
    const { container } = render(
      <MessageMarkdown
        text={"| ID | Status |\n| --- | --- |\n| BKON260016 | A |"}
      />,
    );
    const wrap = container.querySelector(".assistant-md__table-wrap");
    expect(wrap).not.toBeNull();
    expect(wrap?.querySelector("table")).not.toBeNull();
  });

  it("keeps long booking IDs in their own cell (nowrap, not last column)", () => {
    const { container } = render(
      <MessageMarkdown
        text={"| ID | Note |\n| --- | --- |\n| BKON260016 | ok |"}
      />,
    );
    const firstCell = container.querySelector("tbody tr td");
    expect(firstCell?.textContent).toBe("BKON260016");
    // First column stays nowrap; only the last column is allowed to wrap.
    expect(firstCell?.matches("td:last-child")).toBe(false);
  });
});
