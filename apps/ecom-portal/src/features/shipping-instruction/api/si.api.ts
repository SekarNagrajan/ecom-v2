// Modified by Sekar Nagarajan (2026-08-31 15:01)
import type { ApiResponse } from "../../../types/api.types";
import { MOCK_DEFAULT_REFERENCE_FIELDS } from "../../booking/utils/reference-field.utils";
import {
  DEFAULT_SI_WIZARD_CONFIG,
  type SIWizardConfig,
} from "../config/si-wizard-config";
import { MOCK_SI_DETAIL, MOCK_SI_LIST } from "../mocks/si.mock";
import type { SIDTO, SIListDTO } from "../types/si.types";

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/** SI API — mock-backed until REST/OpenAPI is wired. */
export const siApi = {
  async fetchList(): Promise<ApiResponse<SIListDTO[]>> {
    await delay(800); // simulated latency
    return { data: MOCK_SI_LIST };
  },

  async fetchDetails(id: string): Promise<ApiResponse<SIDTO>> {
    await delay(500); // simulated latency
    // Modified by Sekar Nagarajan (2026-09-01 12:41) — resolve by SI id or booking no (dashboard Create SI)
    const listRow = MOCK_SI_LIST.find(
      (row) => row.id === id || row.bookingNo === id,
    );
    const resolvedId = listRow?.id ?? id;
    const bookingNo = listRow?.bookingNo ?? id;
    // Existing SI (has SI no) keeps saved references; create/new starts empty
    const referenceFields = listRow?.siNo
      ? structuredClone(MOCK_DEFAULT_REFERENCE_FIELDS)
      : [];
    return {
      data: {
        ...MOCK_SI_DETAIL,
        id: resolvedId,
        bookingNo,
        siNo: listRow?.siNo ?? null,
        blNo: listRow?.blNo ?? null,
        agencyRefNo: listRow?.agencyRefNo ?? "",
        origin: listRow?.origin ?? MOCK_SI_DETAIL.origin,
        loadPort: listRow?.origin ?? MOCK_SI_DETAIL.loadPort,
        delivery: listRow?.delivery ?? MOCK_SI_DETAIL.delivery,
        dischargePort: listRow?.delivery ?? MOCK_SI_DETAIL.dischargePort,
        referenceFields,
      },
    };
  },

  async fetchWizardConfig(): Promise<ApiResponse<SIWizardConfig>> {
    await delay(200); // simulated config fetch
    return { data: DEFAULT_SI_WIZARD_CONFIG };
  },

  async submit(id: string): Promise<ApiResponse<{ siNo: string }>> {
    await delay(1500); // simulated submit
    return { data: { siNo: `SIN-${id}` } };
  },

  async cancel(id: string): Promise<ApiResponse<{ id: string }>> {
    await delay(400); // simulated cancel
    return { data: { id } };
  },
};

export const fetchSiWizardConfig = () => siApi.fetchWizardConfig();

/** @deprecated Prefer siApi — kept for gradual migration of call sites */
export const fetchSIList = () => siApi.fetchList();
export const fetchSIDetails = (id: string) => siApi.fetchDetails(id);
