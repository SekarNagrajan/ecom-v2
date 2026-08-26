// Modified by Sekar Nagarajan (2026-08-26 12:48)
import type { ApiResponse } from "../../../types/api.types";
import { MOCK_VGM_DATA } from "../mocks/vgm.mock";
import type { VgmDeclarationDTO, VgmSubmitPayload } from "../types/vgm.types";

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/** VGM API — mock-backed until REST/OpenAPI is wired (agenct parity). */
export const vgmApi = {
  async searchReference(
    type: "bookno" | "blno",
    referenceNo: string,
  ): Promise<ApiResponse<VgmDeclarationDTO>> {
    await delay(800); // simulated latency
    const data = MOCK_VGM_DATA[referenceNo];
    if (data && data.referenceDetails.type === type) {
      return { data };
    }
    throw {
      error: { code: "NOT_FOUND", message: "Invalid Booking or BL Number." },
    };
  },

  async submit(
    payload: VgmSubmitPayload,
  ): Promise<ApiResponse<{ message: string }>> {
    await delay(1000); // simulated submit
    void payload;
    return { data: { message: "VGM successfully submitted and email sent." } };
  },
};

/** @deprecated Prefer vgmApi */
export const searchVgmReference = (
  type: "bookno" | "blno",
  referenceNo: string,
) => vgmApi.searchReference(type, referenceNo);

/** @deprecated Prefer vgmApi */
export const submitVgm = (payload: VgmSubmitPayload) => vgmApi.submit(payload);
