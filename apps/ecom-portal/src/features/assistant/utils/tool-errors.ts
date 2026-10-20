// Created for Phase 4 — map tool error codes/strings to i18n message keys so
// cards and status rows never surface a raw error like "FORBIDDEN".

/** Ordered substring matchers: first hit wins. */
const MATCHERS: Array<[RegExp, string]> = [
  [/FORBIDDEN|CAPABILITY|NOT_AUTHENTICATED|UNAUTHORIZED|DENIED/i, "toolErrors.forbidden"],
  [/NOT[_ ]?FOUND/i, "toolErrors.notFound"],
  [/CANCELL?ED|ABORT/i, "toolErrors.cancelled"],
  [/TIME[_ ]?OUT|TIMED[_ ]?OUT/i, "toolErrors.timeout"],
];

/**
 * i18n key (assistant namespace) for a tool error code/message. Unknown or
 * empty codes fall back to a generic message — never the raw string.
 */
export function toolErrorMessageKey(code: string | null | undefined): string {
  if (!code) return "toolErrors.generic";
  for (const [re, key] of MATCHERS) {
    if (re.test(code)) return key;
  }
  return "toolErrors.generic";
}
