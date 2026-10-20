// Modified by Sekar Nagarajan (2026-10-20 13:05)

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE =
  /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/g;
const SECRET_KEY_RE = /^(password|token|secret|api[_-]?key|authorization)$/i;

function redactString(value: string): string {
  return value.replace(EMAIL_RE, "[redacted-email]").replace(PHONE_RE, "[redacted-phone]");
}

/** Deep-redact emails, phones, and secret-shaped keys from tool results. */
export function redactToolContent(
  value: unknown,
  depth = 0,
): unknown {
  if (depth > 8) return "[truncated]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return redactString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.map((item) => redactToolContent(item, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_KEY_RE.test(key)) {
        out[key] = "[redacted]";
      } else {
        out[key] = redactToolContent(child, depth + 1);
      }
    }
    return out;
  }
  return String(value);
}

export function truncateRows<T>(items: T[], maxRows: number): T[] {
  if (items.length <= maxRows) return items;
  return items.slice(0, maxRows);
}
