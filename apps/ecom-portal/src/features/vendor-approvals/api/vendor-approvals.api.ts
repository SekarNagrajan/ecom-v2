// Created by Sekar Nagarajan (2026-11-12 23:50)
/**
 * Vendor approvals data access. Today the queue is derived from the booking / SI / VGM fixtures
 * through the approvals bridge, loaded lazily so the fixtures stay out of the entry bundle.
 * Roadmap B1 swaps the bridge calls for `GET /api/v1/approvals` and `PATCH /api/v1/approvals/{id}`.
 */
import { loadBridge } from "../../../data-source";
import type { ApprovalStatus, VendorApprovalItem } from "../types/vendor-approvals.types";

const approvalsBridge = () =>
  loadBridge(() => import("../../../mocks/fixture-api/bridges/approvals.bridge"));

export const vendorApprovalsApi = {
  async list(): Promise<VendorApprovalItem[]> {
    const { vendorApprovals } = await approvalsBridge();
    return vendorApprovals();
  },

  async applyStatus(
    ids: string[],
    status: Exclude<ApprovalStatus, "PENDING">,
    remarks?: string,
  ): Promise<void> {
    const { applyApprovalStatus } = await approvalsBridge();
    ids.forEach((id) => applyApprovalStatus(id, status, {}, remarks));
  },
};
