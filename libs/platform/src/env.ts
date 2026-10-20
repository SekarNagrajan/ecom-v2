// Modified by Sekar Nagarajan (2026-10-20 13:05)
import { z } from 'zod';

const EnvSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:8080/api/v1'),
  VITE_API_MODE: z.enum(['mock', 'real']).default('mock'),
  VITE_APP_TITLE: z.string().default('Solverminds E-Commerce Portal'),
  /** Kill switch — compare with === 'true' (string, not coerce boolean). */
  VITE_ASSISTANT_ENABLED: z.string().default('false'),
  /** When 'true', MSW stubs /api/assistant/* instead of passthrough. */
  VITE_AI_ASSISTANT_USE_MSW_STUB: z.string().default('false'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

function parseEnv(): EnvConfig {
  const envObj = {
    VITE_API_URL: import.meta.env?.VITE_API_URL || 'http://localhost:8080/api/v1',
    VITE_API_MODE: import.meta.env?.VITE_API_MODE || 'mock',
    VITE_APP_TITLE: import.meta.env?.VITE_APP_TITLE || 'Solverminds E-Commerce Portal',
    VITE_ASSISTANT_ENABLED: import.meta.env?.VITE_ASSISTANT_ENABLED || 'false',
    VITE_AI_ASSISTANT_USE_MSW_STUB:
      import.meta.env?.VITE_AI_ASSISTANT_USE_MSW_STUB || 'false',
  };

  const result = EnvSchema.safeParse(envObj);
  if (!result.success) {
    console.warn('⚠️ Environment config fallback active:', result.error.format());
    return {
      VITE_API_URL: 'http://localhost:8080/api/v1',
      VITE_API_MODE: 'mock',
      VITE_APP_TITLE: 'Solverminds E-Commerce Portal',
      VITE_ASSISTANT_ENABLED: 'false',
      VITE_AI_ASSISTANT_USE_MSW_STUB: 'false',
    };
  }
  return result.data;
}

export const env = parseEnv();
