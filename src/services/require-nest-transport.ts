import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { apiClient } from '@/services/api-client';

/** فقط حمل‌ونقل Nest؛ UI mock همان Facade دامنه را نگه می‌دارد. */
export function requireNestTransport(surface: string): void {
  if (isMockApiMode() || !apiClient.isConfigured) {
    throwRealModeNotImplemented(surface);
  }
}
