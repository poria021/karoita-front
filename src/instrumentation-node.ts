import { reportError } from '@/lib/observability/reportError';

/**
 * Node-only process-level error hooks. Lives in its own module (instead of
 * inline in instrumentation.ts) and is only ever reached via a dynamic
 * `import()` gated by `NEXT_RUNTIME === 'nodejs'` in instrumentation.ts —
 * that keeps `process.on(...)` out of the Edge Runtime bundle entirely,
 * instead of just no-op'ing at runtime, which is what previously produced
 * Next's "A Node.js API is used ... not supported in the Edge Runtime"
 * build warning even though the guard made it harmless.
 */
export function registerNodeProcessHandlers(): void {
  process.on('unhandledRejection', (reason) => {
    void reportError(reason, { source: 'process.unhandledRejection' });
  });
  process.on('uncaughtException', (error) => {
    void reportError(error, { source: 'process.uncaughtException' });
  });
}
