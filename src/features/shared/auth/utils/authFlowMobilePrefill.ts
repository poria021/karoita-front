import { normalizeRememberedMobile } from './rememberedMobile';

const AUTH_FLOW_MOBILE_KEY = 'karvita_auth_flow_mobile';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/** Tab-scoped handoff between login ↔ forgot. Never put the number in the URL. */
export function writeAuthFlowMobilePrefill(mobile: string): void {
  if (!isBrowser()) return;
  const normalized = normalizeRememberedMobile(mobile);
  try {
    if (!normalized) {
      window.sessionStorage.removeItem(AUTH_FLOW_MOBILE_KEY);
      return;
    }
    window.sessionStorage.setItem(AUTH_FLOW_MOBILE_KEY, normalized);
  } catch {}
}

export function consumeAuthFlowMobilePrefill(): string {
  if (!isBrowser()) return '';
  try {
    const stored = window.sessionStorage.getItem(AUTH_FLOW_MOBILE_KEY);
    window.sessionStorage.removeItem(AUTH_FLOW_MOBILE_KEY);
    return stored ? normalizeRememberedMobile(stored) : '';
  } catch {
    return '';
  }
}
