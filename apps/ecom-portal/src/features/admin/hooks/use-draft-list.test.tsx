// Created by Sekar Nagarajan (2026-11-12 13:20)
// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDraftList } from "./use-draft-list";

interface Row {
  id: string;
  isVisible: boolean;
  isRequired: boolean;
}

const server: Row[] = [
  { id: "a", isVisible: true, isRequired: false },
  { id: "b", isVisible: false, isRequired: false },
];

describe("useDraftList", () => {
  it("starts clean and mirrors the server list", () => {
    const { result } = renderHook(() => useDraftList(server, (r) => r.id));
    expect(result.current.items).toEqual(server);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.dirtyCount).toBe(0);
  });

  it("applies a patch to one row and marks only that row dirty", () => {
    const { result } = renderHook(() => useDraftList(server, (r) => r.id));
    act(() => result.current.updateItem("a", { isRequired: true }));
    expect(result.current.items[0]).toEqual({ id: "a", isVisible: true, isRequired: true });
    expect(result.current.items[1]).toBe(server[1]);
    expect(result.current.dirtyIds).toEqual(["a"]);
    expect(result.current.isItemDirty("a")).toBe(true);
    expect(result.current.isItemDirty("b")).toBe(false);
  });

  it("drops an edit that returns to the server value", () => {
    const { result } = renderHook(() => useDraftList(server, (r) => r.id));
    act(() => result.current.updateItem("a", { isRequired: true }));
    act(() => result.current.updateItem("a", { isRequired: false }));
    expect(result.current.isDirty).toBe(false);
    expect(result.current.overrides).toEqual({});
  });

  it("reverts one row and resets all", () => {
    const { result } = renderHook(() => useDraftList(server, (r) => r.id));
    act(() => {
      result.current.updateItem("a", { isRequired: true });
      result.current.updateItem("b", { isVisible: true });
    });
    expect(result.current.dirtyCount).toBe(2);
    act(() => result.current.revertItem("a"));
    expect(result.current.dirtyIds).toEqual(["b"]);
    act(() => result.current.reset());
    expect(result.current.isDirty).toBe(false);
  });

  it("keeps pending edits across a refetch and clears them once the server catches up", () => {
    const { result, rerender } = renderHook(({ rows }) => useDraftList(rows, (r) => r.id), {
      initialProps: { rows: server },
    });
    act(() => result.current.updateItem("a", { isRequired: true }));

    // background refetch returns a new array with the same values → edit survives
    rerender({ rows: server.map((r) => ({ ...r })) });
    expect(result.current.items[0].isRequired).toBe(true);
    expect(result.current.isDirty).toBe(true);

    // after save + invalidate the server row matches the edit → no longer dirty
    rerender({ rows: [{ ...server[0], isRequired: true }, server[1]] });
    expect(result.current.isDirty).toBe(false);
    expect(result.current.items[0].isRequired).toBe(true);
  });
});
