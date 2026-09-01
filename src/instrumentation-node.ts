import { reportError } from '@/lib/observability/reportError';

/**
 * هوک خطای سطح `process` فقط برای Node. جدا از `instrumentation.ts` است و فقط با
 * `import()` پویا وقتی `NEXT_RUNTIME === 'nodejs'` صدا می‌شود تا `process.on(...)`
 * اصلاً وارد باندل Edge نشود — نه اینکه در runtime no-op شود؛ قبلاً همان گارد
 * بی‌خطر بود ولی نکست هشدار «A Node.js API is used ... not supported in the Edge Runtime»
 * می‌داد.
 */
export function registerNodeProcessHandlers(): void {
  process.on('unhandledRejection', (reason) => {
    void reportError(reason, { source: 'process.unhandledRejection' });
  });
  process.on('uncaughtException', (error) => {
    void reportError(error, { source: 'process.uncaughtException' });
  });
}
