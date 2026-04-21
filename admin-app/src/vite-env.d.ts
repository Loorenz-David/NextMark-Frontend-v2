/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DRIVER_LIVE_DEV_SEED_ENABLED?: string;
  readonly VITE_DRIVER_LIVE_DEV_SEED_POSITIONS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
