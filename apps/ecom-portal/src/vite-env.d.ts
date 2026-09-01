// Created by Sekar Nagarajan (2026-09-01 18:40)
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AIS_PROXY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
