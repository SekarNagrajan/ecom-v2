// Modified by Sekar Nagarajan (2026-11-13 00:20)
/**
 * Typed `import.meta.env` for the portal. Every `VITE_*` key the app reads is declared here so a
 * typo or a bad value is caught at startup instead of silently falling back to mock mode.
 *
 * In development a parse failure logs the issues and falls back to safe defaults. In a production
 * build it throws, because shipping a build that quietly points at the mock backend is worse than a
 * visible startup error.
 */
import { z } from "zod";

const booleanFlag = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => value === "true");

const EnvSchema = z.object({
  VITE_API_URL: z.url().default("http://localhost:8080/api/v1"),
  VITE_API_MODE: z.enum(["mock", "real"]).default("mock"),
  VITE_APP_TITLE: z.string().default("Solverminds E-Commerce Portal"),
  /** AG Grid Enterprise key; also injected at build time as `__AG_GRID_LICENSE_KEY__` for shared-ui. */
  VITE_AG_GRID_LICENSE_KEY: z.string().optional(),
  /** WebSocket proxy for live AIS vessel positions (tracking map). */
  VITE_AIS_PROXY_URL: z.string().optional(),
  /** Conversational assistant launcher (roadmap F11); off unless explicitly "true". */
  VITE_ASSISTANT_ENABLED: booleanFlag,
});

export type EnvConfig = z.infer<typeof EnvSchema>;

const FALLBACK: EnvConfig = {
  VITE_API_URL: "http://localhost:8080/api/v1",
  VITE_API_MODE: "mock",
  VITE_APP_TITLE: "Solverminds E-Commerce Portal",
  VITE_AG_GRID_LICENSE_KEY: undefined,
  VITE_AIS_PROXY_URL: undefined,
  VITE_ASSISTANT_ENABLED: false,
};

/** Empty strings in `.env` files mean "unset", not "empty value". */
const blankToUndefined = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

function parseEnv(): EnvConfig {
  const raw = (import.meta.env ?? {}) as Record<string, unknown>;
  const candidate = Object.fromEntries(
    Object.keys(EnvSchema.shape).map((key) => [key, blankToUndefined(raw[key])]),
  );

  const result = EnvSchema.safeParse(candidate);
  if (result.success) return result.data;

  const issues = result.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  if (import.meta.env?.PROD) {
    throw new Error(`Invalid environment configuration — ${issues}`);
  }
  console.warn(`⚠️ Environment config fallback active (mock mode): ${issues}`);
  return FALLBACK;
}

export const env = parseEnv();
