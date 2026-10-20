// Modified by Sekar Nagarajan (2026-10-20 19:40)
import type { AssistantEvent } from "../types/assistant.types";

function parseEventBlock(block: string): AssistantEvent | null {
  let event = "message";
  const data: string[] = [];
  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
  }
  if (!data.length) return null;
  return {
    type: event,
    ...(JSON.parse(data.join("\n")) as object),
  } as AssistantEvent;
}

/**
 * Incremental SSE parser: decode UTF-8, split on blank lines, tolerate
 * event:/data: in either order, buffer partial frames across chunks.
 */
export async function* parseSse(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<AssistantEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) {
      buf += decoder.decode();
      break;
    }
    buf += decoder.decode(value, { stream: true });
    // Frame boundary is a blank line — LF from the MSW stub, CRLF from
    // sse-starlette. A bare \r at the buffer end may pair with the next
    // chunk, so only consume boundaries fully present in the buffer.
    let m: RegExpExecArray | null;
    const boundary = /\r?\n\r?\n/;
    while ((m = boundary.exec(buf)) !== null) {
      const block = buf.slice(0, m.index);
      buf = buf.slice(m.index + m[0].length);
      const parsed = parseEventBlock(block);
      if (parsed) yield parsed;
    }
  }
  if (buf.trim()) {
    const parsed = parseEventBlock(buf);
    if (parsed) yield parsed;
  }
}
