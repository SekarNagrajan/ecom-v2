// Modified by Sekar Nagarajan (2026-10-20 13:05)
import { describe, expect, it } from "vitest";

import { parseSse } from "./sse-parser";

function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      if (i >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(chunks[i]));
      i += 1;
    },
  });
}

async function collect(
  stream: ReadableStream<Uint8Array>,
): Promise<unknown[]> {
  const out: unknown[] = [];
  for await (const event of parseSse(stream)) {
    out.push(event);
  }
  return out;
}

describe("parseSse", () => {
  it("parses a complete event block", async () => {
    const events = await collect(
      streamFromChunks([
        'event: meta\ndata: {"conversation_id":"c1","request_id":"r1"}\n\n',
        'event: token\ndata: {"delta":"Hi"}\n\n',
        'event: done\ndata: {"awaiting_tools":false,"pending_call_ids":[]}\n\n',
      ]),
    );
    expect(events).toEqual([
      { type: "meta", conversation_id: "c1", request_id: "r1" },
      { type: "token", delta: "Hi" },
      { type: "done", awaiting_tools: false, pending_call_ids: [] },
    ]);
  });

  it("handles mid-line chunk splits", async () => {
    const events = await collect(
      streamFromChunks([
        "event: tok",
        'en\ndata: {"del',
        'ta":"Hello"}\n\n',
      ]),
    );
    expect(events).toEqual([{ type: "token", delta: "Hello" }]);
  });

  it("handles mid-event chunk splits across the blank separator", async () => {
    const events = await collect(
      streamFromChunks([
        'event: citation\ndata: {"route":"/app/tracking","title":"T","marker":"[[cite:/app/tracking|T]]"}\n',
        "\n",
        'event: done\ndata: {"awaiting_tools":false,"pending_call_ids":[]}\n\n',
      ]),
    );
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      type: "citation",
      route: "/app/tracking",
      title: "T",
    });
    expect(events[1]).toMatchObject({ type: "done", awaiting_tools: false });
  });

  it("joins multi-line data payloads", async () => {
    const multi = await collect(
      streamFromChunks([
        "event: token\n",
        'data: {"delta":\n',
        'data: "xy"}\n\n',
      ]),
    );
    expect(multi).toEqual([{ type: "token", delta: "xy" }]);
  });
});

// Added by Sekar Nagarajan (2026-10-20 19:40)
it("parses CRLF-framed events (sse-starlette) including split pairs", async () => {
  const frames =
    'event: meta\r\ndata: {"conversation_id":"c1","request_id":"r1"}\r\n\r\n' +
    'event: token\r\ndata: {"delta":"Hi"}\r\n\r\n' +
    'event: done\r\ndata: {"awaiting_tools":false,"pending_call_ids":[]}\r\n\r\n';
  // split mid-CRLF-boundary to prove partial pairs are buffered
  const cut = frames.indexOf("\r\n\r\n") + 2;
  const events = [];
  for await (const e of parseSse(streamFromChunks([frames.slice(0, cut), frames.slice(cut)]))) {
    events.push(e);
  }
  expect(events.map((e) => e.type)).toEqual(["meta", "token", "done"]);
});
