// Modified by Sekar Nagarajan (2026-10-20 13:05)
import { z } from "zod";

import { fetchBLList } from "../../bill-of-lading/api/bl.api";
import { bookingApi } from "../../booking/api/booking.api";
import type { BookingListDTO } from "../../booking/types/booking-list.types";
import { computeCarbon } from "../../carbon-calculator/api/carbon.api";
import { croApi } from "../../container-release-order/api/cro.api";
import { getStatement } from "../../customer-statement/api/customer-statement.api";
import { dashboardApi } from "../../dashboard/api/dashboard.api";
import { doApi } from "../../delivery-order/api/delivery-order.api";
import { arnApi } from "../../arrival-notice/api/arrival-notice.api";
import { fetchHotlineContacts } from "../../agency-hotline/api/hotline.api";
import { fetchQuotes, fetchTariffs } from "../../rates/api/rates.api";
import { schedulesApi } from "../../schedules/api/schedules.api";
import { siApi } from "../../shipping-instruction/api/si.api";
import { trackingApi } from "../../tracking/api/tracking.api";
import { vgmApi } from "../../vgm/api/vgm.api";
import { redactToolContent, truncateRows } from "./redact";
import type { ToolContext, ToolDef, ToolRunOutcome } from "./tool.types";

const pageSchema = z.object({
  status: z.string().optional(),
  page: z.number().int().positive().optional(),
  page_size: z.number().int().positive().max(50).optional(),
});

function unwrapData<T>(res: { data?: T; error?: { message?: string } }): T {
  if (res.error) {
    throw new Error(res.error.message ?? "API error");
  }
  if (res.data === undefined) {
    throw new Error("Empty API response");
  }
  return res.data;
}

const trackShipment: ToolDef<{
  search_type: string;
  search_value: string;
}> = {
  name: "track_shipment",
  capability: null,
  maxRows: 1,
  schema: z.object({
    search_type: z.enum(["CONTAINER", "BOOKING", "BL", "container", "booking", "bl"]),
    search_value: z.string().min(1),
  }),
  async run(args) {
    const searchType = args.search_type.toUpperCase() as
      | "CONTAINER"
      | "BOOKING"
      | "BL";
    const result = await trackingApi.getTrackingDetails({
      searchType,
      searchValue: args.search_value,
    });
    if (!result) {
      return { found: false, search_type: searchType, search_value: args.search_value };
    }
    return {
      found: true,
      searchKey: result.searchKey,
      bookingNo: result.bookingNo,
      blNo: result.blNo,
      vessel: result.vesselName,
      voyage: result.voyage,
      pol: result.polPortCode,
      pod: result.podPortCode,
      progressPercent: result.progressPercent,
      containers: truncateRows(result.containers ?? [], 5).map((c) => ({
        containerNo: c.containerNo,
        status: c.status,
        lastLocation: c.activityLocation,
        latestActivity: c.latestActivity,
      })),
    };
  },
};

const searchSchedules: ToolDef<{
  origin?: string;
  destination?: string;
  etd_from?: string;
  etd_to?: string;
}> = {
  name: "search_schedules",
  capability: null,
  maxRows: 5,
  schema: z.object({
    origin: z.string().optional(),
    destination: z.string().optional(),
    etd_from: z.string().optional(),
    etd_to: z.string().optional(),
  }),
  async run(args) {
    const items = await schedulesApi.searchSchedules({
      searchType: "POINT_TO_POINT",
      polCode: args.origin,
      podCode: args.destination,
      fromDate: args.etd_from,
      toDate: args.etd_to,
      dateType: "DEPARTURE",
    });
    const sailings = truncateRows(items, 5).map((s) => ({
      id: s.id,
      vessel: s.vesselName,
      voyage: s.voyage,
      pol: s.polPortId,
      pod: s.podPortId,
      etd: s.etd,
      eta: s.eta,
      bookingAllowed: s.bookingAllowed,
      transitTimeDays: s.transitTimeDays,
    }));
    return { count: sailings.length, sailings };
  },
};

const listBookings: ToolDef<{
  status?: string;
  page?: number;
  page_size?: number;
}> = {
  name: "list_bookings",
  capability: "BKG",
  maxRows: 10,
  schema: pageSchema,
  async run(args) {
    const res = await fetch("/api/booking/list");
    const json = (await res.json()) as { data?: BookingListDTO[] };
    let rows = json.data ?? [];
    if (args.status) {
      const needle = args.status.toLowerCase();
      rows = rows.filter((r) => r.status.toLowerCase().includes(needle));
    }
    const page = args.page ?? 1;
    const pageSize = args.page_size ?? 10;
    const start = (page - 1) * pageSize;
    const slice = truncateRows(rows.slice(start, start + pageSize), listBookings.maxRows);
    return {
      items: slice.map((r) => ({
        id: r.id,
        status: r.status,
        origin: r.origin,
        delivery: r.delivery,
        cargoReadyDate: r.submittedDate || r.createdDate,
        bookingNo: r.bookingNo,
      })),
    };
  },
};

const getBooking: ToolDef<{ booking_id: string }> = {
  name: "get_booking",
  capability: "BKG",
  maxRows: 1,
  schema: z.object({ booking_id: z.string().min(1) }),
  async run(args) {
    const booking = await bookingApi.getBookingById(args.booking_id);
    return {
      booking_id: args.booking_id,
      draftId: booking.draftId ?? null,
      masterDetails: booking.masterDetails
        ? {
            origin: booking.masterDetails.origin,
            delivery: booking.masterDetails.delivery,
            cargoReadyDate: booking.masterDetails.cargoReadyDate,
          }
        : null,
    };
  },
};

const listShippingInstructions: ToolDef<{ status?: string; page?: number }> = {
  name: "list_shipping_instructions",
  capability: "SI",
  maxRows: 10,
  schema: pageSchema,
  async run() {
    const data = unwrapData(await siApi.fetchList());
    return {
      items: truncateRows(data, 10).map((row) => ({
        id: row.id,
        status: row.status,
        bookingNo: row.bookingNo,
        siNo: row.siNo,
      })),
    };
  },
};

const listBillsOfLading: ToolDef<{ status?: string; page?: number }> = {
  name: "list_bills_of_lading",
  capability: "BL",
  maxRows: 10,
  schema: pageSchema,
  async run() {
    const data = unwrapData(await fetchBLList());
    return {
      items: truncateRows(data, 10).map((row) => ({
        blNo: row.blNo,
        status: row.status,
        bookingNo: row.bookingNo,
        origin: row.origin,
        delivery: row.delivery,
      })),
    };
  },
};

const listVgm: ToolDef<{ status?: string; page?: number; reference?: string; type?: string }> = {
  name: "list_vgm",
  capability: "VGM",
  maxRows: 5,
  schema: pageSchema.extend({
    reference: z.string().optional(),
    type: z.enum(["bookno", "blno"]).optional(),
  }),
  async run(args) {
    if (!args.reference) {
      return {
        items: [],
        note: "VGM lookup requires a booking or BL reference (type + reference).",
      };
    }
    const type: "bookno" | "blno" = args.type === "blno" ? "blno" : "bookno";
    const res = await vgmApi.searchReference(type, args.reference);
    const data = unwrapData(res);
    return {
      items: [
        {
          bookingNo: (data as { bookingNo?: string }).bookingNo,
          blNo: (data as { blNo?: string }).blNo,
          status: (data as { status?: string }).status,
        },
      ],
    };
  },
};

const listCro: ToolDef<{ status?: string; page?: number }> = {
  name: "list_cro",
  capability: "CRO",
  maxRows: 10,
  schema: pageSchema,
  async run() {
    const data = unwrapData(await croApi.fetchList());
    return {
      items: truncateRows(data, 10).map((row) => ({
        id: (row as { id?: string }).id,
        status: (row as { status?: string }).status,
        croNo: (row as { croNo?: string }).croNo,
      })),
    };
  },
};

const listDeliveryOrders: ToolDef<{ status?: string; page?: number }> = {
  name: "list_delivery_orders",
  capability: "DO",
  maxRows: 10,
  schema: pageSchema,
  async run() {
    const data = unwrapData(await doApi.fetchList());
    return {
      items: truncateRows(data, 10).map((row) => ({
        id: (row as { id?: string }).id,
        status: (row as { status?: string }).status,
        doNo: (row as { doNo?: string }).doNo,
      })),
    };
  },
};

const listArrivalNotices: ToolDef<{ status?: string; page?: number }> = {
  name: "list_arrival_notices",
  capability: "ARN",
  maxRows: 10,
  schema: pageSchema,
  async run() {
    const data = unwrapData(await arnApi.fetchList());
    return {
      items: truncateRows(data, 10).map((row) => ({
        id: (row as { id?: string }).id,
        status: (row as { status?: string }).status,
        arnNo: (row as { arnNo?: string }).arnNo,
      })),
    };
  },
};

const getCustomerStatement: ToolDef<{
  from_date?: string;
  to_date?: string;
  account_id?: string;
  currency?: string;
}> = {
  name: "get_customer_statement",
  capability: "PAY",
  maxRows: 20,
  schema: z.object({
    from_date: z.string().optional(),
    to_date: z.string().optional(),
    account_id: z.string().optional(),
    currency: z.string().optional(),
  }),
  async run(args) {
    const today = new Date();
    const toDate =
      args.to_date ?? today.toISOString().slice(0, 10);
    const from = new Date(today);
    from.setMonth(from.getMonth() - 1);
    const fromDate = args.from_date ?? from.toISOString().slice(0, 10);
    const data = unwrapData(
      await getStatement({
        accountId: args.account_id ?? "default",
        currency: args.currency ?? "USD",
        fromDate,
        toDate,
      }),
    );
    return {
      fromDate,
      toDate,
      summary: {
        openingBalance: data.openingBalance,
        closingBalance: data.closingBalance,
        lineCount: data.lines.length,
      },
    };
  },
};

const estimateCarbon: ToolDef<{
  origin: string;
  destination: string;
  containers: number;
}> = {
  name: "estimate_carbon",
  capability: null,
  maxRows: 1,
  schema: z.object({
    origin: z.string().min(1),
    destination: z.string().min(1),
    containers: z.number().positive(),
  }),
  async run(args) {
    const res = await computeCarbon({
      origin: args.origin,
      destination: args.destination,
      cargoWeightKg: args.containers * 14000,
      equipment: "40HC",
      containerCount: args.containers,
      unit: "kg",
    });
    const data = unwrapData(res);
    return {
      origin: args.origin,
      destination: args.destination,
      containers: args.containers,
      result: data,
    };
  },
};

const getRates: ToolDef<{
  origin?: string;
  destination?: string;
  container_type?: string;
}> = {
  name: "get_rates",
  capability: null,
  maxRows: 5,
  schema: z.object({
    origin: z.string().optional(),
    destination: z.string().optional(),
    container_type: z.string().optional(),
  }),
  async run(args) {
    const [tariffs, quotes] = await Promise.all([
      fetchTariffs({
        loadPort: args.origin,
        dischPort: args.destination,
        eqpType: args.container_type,
      }),
      fetchQuotes(),
    ]);
    return {
      tariffs: truncateRows(tariffs as unknown[], 5),
      quotes: truncateRows(quotes as unknown[], 5),
      container_type: args.container_type ?? null,
    };
  },
};

const getDashboardSummary: ToolDef<Record<string, never>> = {
  name: "get_dashboard_summary",
  capability: null,
  maxRows: 1,
  schema: z.object({}),
  async run() {
    const summary = await dashboardApi.getSummary();
    return { summary };
  },
};

const getHotline: ToolDef<Record<string, never>> = {
  name: "get_hotline",
  capability: null,
  maxRows: 20,
  schema: z.object({}),
  async run() {
    const contacts = await fetchHotlineContacts();
    return { contacts: contacts as unknown as Record<string, unknown> };
  },
};

export const TOOL_REGISTRY: ToolDef[] = [
  trackShipment,
  searchSchedules,
  listBookings,
  getBooking,
  listShippingInstructions,
  listBillsOfLading,
  listVgm,
  listCro,
  listDeliveryOrders,
  listArrivalNotices,
  getCustomerStatement,
  estimateCarbon,
  getRates,
  getDashboardSummary,
  getHotline,
];

const byName = new Map(TOOL_REGISTRY.map((t) => [t.name, t]));

export function getTool(name: string): ToolDef | undefined {
  return byName.get(name);
}

/** Tool names the model may call given capability + auth. */
export function availableTools(
  can: (code: string) => boolean,
  isAuthenticated: boolean,
): string[] {
  return TOOL_REGISTRY.filter((tool) => {
    if (!isAuthenticated && tool.capability !== null) return false;
    if (tool.capability === null) return true;
    return can(tool.capability);
  }).map((t) => t.name);
}

const TOOL_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("TIMEOUT")), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err: unknown) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function executeTool(
  name: string,
  rawArgs: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ToolRunOutcome> {
  const tool = getTool(name);
  if (!tool) {
    return {
      ok: false,
      error: { code: "UNKNOWN_TOOL", message: `Unknown tool: ${name}` },
    };
  }
  if (!ctx.isAuthenticated && tool.capability !== null) {
    return {
      ok: false,
      error: {
        code: "NOT_AUTHENTICATED",
        message: "Sign in required for this tool",
      },
    };
  }
  if (tool.capability !== null && !ctx.can(tool.capability)) {
    return {
      ok: false,
      error: {
        code: "CAPABILITY_DENIED",
        message: `Missing capability ${tool.capability}`,
      },
    };
  }
  const parsed = tool.schema.safeParse(rawArgs);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_ARGS",
        message: parsed.error.issues.map((i) => i.message).join("; "),
      },
    };
  }
  try {
    const content = await withTimeout(
      tool.run(parsed.data, ctx),
      TOOL_TIMEOUT_MS,
    );
    const redacted = redactToolContent(content) as Record<string, unknown>;
    return { ok: true, content: redacted };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "TIMEOUT") {
      return {
        ok: false,
        error: { code: "TIMEOUT", message: `Tool ${name} timed out` },
      };
    }
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "object" &&
            err !== null &&
            "error" in err &&
            typeof (err as { error?: { message?: string } }).error?.message ===
              "string"
          ? (err as { error: { message: string } }).error.message
          : "Tool failed";
    return {
      ok: false,
      error: { code: "TOOL_FAILED", message },
    };
  }
}
