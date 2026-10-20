// Created for Phase 6 — a completed message collapses its successful tool rows
// into one expandable, keyboard-accessible summary. Failed tools are not part
// of the group (the bubble renders them as standalone warning rows).
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await (importOriginal() as Promise<Record<string, unknown>>);
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, opts?: Record<string, unknown>) =>
        (opts?.tools as string) ?? (opts?.defaultValue as string) ?? key,
      i18n: { language: "en" },
    }),
  };
});

import type { ToolRunState } from "../types/assistant.types";
import { ToolStatusGroup } from "./ToolStatusGroup";

afterEach(cleanup);

const runs: ToolRunState[] = [
  { callId: "a", tool: "list_bookings", status: "done" },
  { callId: "b", tool: "search_schedules", status: "done" },
];

describe("Phase 6 — ToolStatusGroup", () => {
  it("renders a collapsed, keyboard-accessible summary that starts closed", () => {
    render(<ToolStatusGroup runs={runs} />);
    const toggle = screen.getByRole("button");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    // Detail rows are hidden until expanded.
    expect(document.querySelector(".assistant-tool-group__list")).toBeNull();
  });

  it("expands on click to reveal each tool run", () => {
    render(<ToolStatusGroup runs={runs} />);
    const toggle = screen.getByRole("button");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(
      document.querySelector(".assistant-tool-group__list"),
    ).not.toBeNull();
    expect(document.querySelectorAll(".assistant-tool-row")).toHaveLength(2);
  });

  it("renders nothing when there are no runs", () => {
    const { container } = render(<ToolStatusGroup runs={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
