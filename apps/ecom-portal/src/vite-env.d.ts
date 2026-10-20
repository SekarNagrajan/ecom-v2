// Modified by Sekar Nagarajan (2026-10-20 14:14)
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AIS_PROXY_URL?: string;
  readonly VITE_AG_GRID_LICENSE_KEY?: string;
  readonly VITE_ASSISTANT_ENABLED?: string;
  readonly VITE_AI_ASSISTANT_USE_MSW_STUB?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
