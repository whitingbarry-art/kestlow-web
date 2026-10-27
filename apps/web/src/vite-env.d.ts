/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The deployed API's address, e.g. https://kestlow-api.example.workers.dev. Unset locally. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
