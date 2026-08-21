import { z } from 'zod';

const EnvSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:8080/api/v1'),
  VITE_API_MODE: z.enum(['mock', 'real']).default('mock'),
  VITE_APP_TITLE: z.string().default('Solverminds E-Commerce Portal'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

function parseEnv(): EnvConfig {
  const envObj = {
    VITE_API_URL: import.meta.env?.VITE_API_URL || 'http://localhost:8080/api/v1',
    VITE_API_MODE: import.meta.env?.VITE_API_MODE || 'mock',
    VITE_APP_TITLE: import.meta.env?.VITE_APP_TITLE || 'Solverminds E-Commerce Portal',
  };

  const result = EnvSchema.safeParse(envObj);
  if (!result.success) {
    console.warn('⚠️ Environment config fallback active:', result.error.format());
    return {
      VITE_API_URL: 'http://localhost:8080/api/v1',
      VITE_API_MODE: 'mock',
      VITE_APP_TITLE: 'Solverminds E-Commerce Portal',
    };
  }
  return result.data;
}

export const env = parseEnv();
