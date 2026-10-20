// Modified by Sekar Nagarajan (2026-10-20 22:10)
import { http, HttpResponse } from "msw";

/**
 * Live assistant (default): leave `/api/assistant/*` unhandled by MSW so the
 * browser hits Vite's streaming proxy directly (see ecomAssistantProxyPlugin).
 *
 * Offline stubs: set `VITE_AI_ASSISTANT_USE_MSW_STUB=true` before starting Vite.
 */

const useMswStub =
  String(import.meta.env.VITE_AI_ASSISTANT_USE_MSW_STUB ?? "").toLowerCase() ===
  "true";

function encodeSse(events: Array<{ event: string; data: unknown }>): Uint8Array {
  const text = events
    .map(
      (e) =>
        `event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`,
    )
    .join("");
  return new TextEncoder().encode(text);
}

function cargoReadyPlus7(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

function stubChatStream(message: string): ReadableStream<Uint8Array> {
  const trackScript = /track/i.test(message);
  const bookScript = /\bbook\b/i.test(message);
  const events: Array<{ event: string; data: unknown }> = [
    {
      event: "meta",
      data: {
        conversation_id: "stub-conv-001",
        request_id: "stub-req-001",
      },
    },
  ];

  if (trackScript) {
    events.push(
      {
        event: "token",
        data: { delta: "Let me check that." },
      },
      {
        event: "tool_call",
        data: {
          call_id: "toolu_stub_track",
          name: "track_shipment",
          arguments: {
            search_type: "CONTAINER",
            search_value: "SMLU8829102",
          },
        },
      },
      {
        event: "done",
        data: {
          awaiting_tools: true,
          pending_call_ids: ["toolu_stub_track"],
        },
      },
    );
  } else if (bookScript) {
    events.push(
      {
        event: "token",
        data: {
          delta: "I can prepare a booking draft for you. Review the card below.",
        },
      },
      {
        event: "ui_action",
        data: {
          call_id: "toolu_stub_prefill",
          kind: "ui_action",
          name: "prefill_booking",
          arguments: {
            origin: "INMAA",
            delivery: "NLRTM",
            cargo_ready_date: cargoReadyPlus7(),
          },
        },
      },
      {
        event: "done",
        data: { awaiting_tools: false, pending_call_ids: [] },
      },
    );
  } else {
    const reply =
      "Hello! Here is a short markdown sample:\n\n| Port | Code |\n| --- | --- |\n| Singapore | SGSIN |\n| Rotterdam | NLRTM |\n\nAsk about schedules, tracking, or bookings.";
    for (const chunk of reply.match(/[\s\S]{1,24}/g) ?? [reply]) {
      events.push({ event: "token", data: { delta: chunk } });
    }
    events.push({
      event: "citation",
      data: {
        route: "/app/tracking",
        title: "Tracking",
        marker: "[[cite:/app/tracking|Tracking]]",
      },
    });
    events.push({
      event: "done",
      data: { awaiting_tools: false, pending_call_ids: [] },
    });
  }

  const bytes = encodeSse(events);
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

function stubToolResumeStream(): ReadableStream<Uint8Array> {
  const reply =
    "Tracking lookup finished (stub). Container SMLU8829102 is in transit.";
  const events: Array<{ event: string; data: unknown }> = [
    {
      event: "meta",
      data: {
        conversation_id: "stub-conv-001",
        request_id: "stub-req-002",
      },
    },
    { event: "token", data: { delta: reply } },
    {
      event: "citation",
      data: {
        route: "/app/tracking",
        title: "SMLU8829102",
        marker: "[[cite:/app/tracking|SMLU8829102]]",
      },
    },
    {
      event: "done",
      data: { awaiting_tools: false, pending_call_ids: [] },
    },
  ];
  const bytes = encodeSse(events);
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

export const assistantStubHandlers = [
  http.post("/api/assistant/v1/chat", async ({ request }) => {
    const body = (await request.json()) as {
      message?: string | null;
      tool_results?: unknown[] | null;
    };
    const stream =
      body.tool_results && body.tool_results.length > 0
        ? stubToolResumeStream()
        : stubChatStream(body.message ?? "");
    return new HttpResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  }),

  http.get("/api/assistant/v1/conversations/:id", ({ params }) => {
    return HttpResponse.json({
      conversation_id: params.id,
      turn_count: 1,
      pending_tool_calls: [],
      updated_at: new Date().toISOString(),
    });
  }),

  http.post("/api/assistant/v1/feedback", () => {
    return new HttpResponse(null, { status: 204 });
  }),
];

/**
 * Live path: no MSW handlers. The service worker itself also early-returns for
 * `/api/assistant/*` (see public/mockServiceWorker.js) so SSE never goes through
 * SW-mediated fetch — that path was the permanent "Connection lost" root cause.
 */
export const assistantPassthroughHandlers: typeof assistantStubHandlers = [];

export const assistantHandlers = useMswStub
  ? assistantStubHandlers
  : assistantPassthroughHandlers;
