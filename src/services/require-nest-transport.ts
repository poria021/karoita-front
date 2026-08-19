import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { apiClient } from '@/services/api-client';

/** Real Nest transport only — mock UI keeps using existing domain facades. */
export function requireNestTransport(surface: string): void {
  if (isMockApiMode() || !apiClient.isConfigured) {
    throwRealModeNotImplemented(surface);
  }
}
