/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string
  readonly VITE_CASHFREE_CLIENT_ID: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '@sentry/react' {
  export function init(options?: any): void;
  export function captureException(exception: any, captureContext?: any): string;
  export function captureMessage(message: string, captureContext?: any): string;
  export function browserTracingIntegration(options?: any): any;
  export function replayIntegration(options?: any): any;
}