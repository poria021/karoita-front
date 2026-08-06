/**
 * Project-wide browser connectivity monitor (optimized).
 *
 * Strategy:
 * - Trust `offline` immediately (navigator is reliable for hard disconnect).
 * - In mock / without a real API host: trust `navigator.onLine` only.
 *   Do NOT hit public NCSI hosts (often blocked/flaky → false offline toasts).
 * - In real mode with a non-loopback API URL: confirm WAN via API probe.
 * - Hysteresis: 2 probe failures → offline, 1 success → online.
 * - Adaptive schedule: fast while offline / verifying; slow while stably online; pause when tab hidden.
 * - Drive TanStack Query `onlineManager` from the same source of truth.
 */

import { onlineManager } from '@tanstack/react-query';

import { isMockApiMode } from '@/lib/api-mode';
import { useNetworkStore } from '@/store/useNetworkStore';

export const NETWORK_OFFLINE_TOAST_ID = 'karvita-network-offline';
export const NETWORK_ONLINE_TOAST_ID = 'karvita-network-online';

type NetworkToastHandlers = {
  onOffline: () => void;
  onOnline: () => void;
};

const PROBE_TIMEOUT_MS = 2500;
/** While offline — retry often so reconnect feels snappy. */
const OFFLINE_POLL_MS = 4000;
/** While stably online — keep traffic low. */
const ONLINE_POLL_MS = 25_000;
/** After browser `online` / tab focus — verify quickly once. */
const VERIFY_POLL_MS = 1500;
const FAIL_STREAK_TO_OFFLINE = 2;

let initialized = false;
let toastHandlers: NetworkToastHandlers | null = null;
let pollTimer: ReturnType<typeof setTimeout> | null = null;
let handleOnline: (() => void) | null = null;
let handleOffline: (() => void) | null = null;
let handleVisibility: (() => void) | null = null;
let syncInFlight: Promise<void> | null = null;
let pendingResync: boolean | null = null;
let failStreak = 0;
let rqListenerInstalled = false;

function isLoopbackUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '[::1]'
    );
  } catch {
    return true;
  }
}

/**
 * Probe targets only when we have a real Nest host to reach.
 * Returns null → navigator-only mode (mock / missing API URL).
 */
function resolveProbeUrls(): readonly string[] | null {
  if (isMockApiMode()) return null;

  const api = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
  if (!api || isLoopbackUrl(api)) return null;

  // Any HTTP response (incl. 404) proves reachability; `/health` is conventional.
  return [`${api}/health`, api];
}

function applyOnline(next: boolean, announce: boolean) {
  const prev = useNetworkStore.getState().isOnline;
  if (prev === next) return;
  useNetworkStore.getState().setOnline(next);
  onlineManager.setOnline(next);
  if (!announce || !toastHandlers) return;
  if (next) toastHandlers.onOnline();
  else toastHandlers.onOffline();
}

function readNavigatorOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

function clearPollTimer() {
  if (pollTimer != null) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

function scheduleNextPoll(delayMs: number) {
  clearPollTimer();
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    return;
  }
  pollTimer = setTimeout(() => {
    queueSync(true);
  }, delayMs);
}

async function probeUrl(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    await fetch(url, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      credentials: 'omit',
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

/** True when at least one probe target is reachable (or navigator-only + online). */
export async function probeInternetReachable(): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  if (!readNavigatorOnline()) return false;

  const urls = resolveProbeUrls();
  if (!urls) return true;

  const results = await Promise.all(urls.map((url) => probeUrl(url)));
  return results.some(Boolean);
}

async function syncConnectivity(announce: boolean): Promise<void> {
  if (!readNavigatorOnline()) {
    failStreak = FAIL_STREAK_TO_OFFLINE;
    applyOnline(false, announce);
    scheduleNextPoll(OFFLINE_POLL_MS);
    return;
  }

  const urls = resolveProbeUrls();
  if (!urls) {
    // Mock / no Nest host: browser link status is enough — avoid false offline.
    failStreak = 0;
    applyOnline(true, announce);
    scheduleNextPoll(ONLINE_POLL_MS);
    return;
  }

  const reachable = await probeInternetReachable();
  if (reachable) {
    failStreak = 0;
    applyOnline(true, announce);
    scheduleNextPoll(ONLINE_POLL_MS);
    return;
  }

  failStreak += 1;
  if (failStreak >= FAIL_STREAK_TO_OFFLINE) {
    applyOnline(false, announce);
  }
  scheduleNextPoll(
    useNetworkStore.getState().isOnline ? VERIFY_POLL_MS : OFFLINE_POLL_MS
  );
}

function queueSync(announce: boolean): void {
  if (syncInFlight) {
    pendingResync = pendingResync === true || announce;
    return;
  }

  syncInFlight = syncConnectivity(announce).finally(() => {
    syncInFlight = null;
    if (pendingResync !== null) {
      const nextAnnounce = pendingResync;
      pendingResync = null;
      queueSync(nextAnnounce);
    }
  });
}

function installQueryOnlineBridge() {
  if (rqListenerInstalled) return;
  rqListenerInstalled = true;
  // We own connectivity; disable Query's naive window online/offline listener.
  onlineManager.setEventListener(() => () => {});
}

/** Clear toast announcers (e.g. when leaving the dashboard shell). */
export function clearNetworkToastHandlers(): void {
  toastHandlers = null;
}

/**
 * Idempotent. Mount from NetworkStatusWatcher inside the dashboard shell only.
 */
export function ensureNetworkMonitoring(handlers?: NetworkToastHandlers): void {
  if (typeof window === 'undefined') return;

  if (handlers) {
    toastHandlers = handlers;
  }

  if (initialized) {
    if (!useNetworkStore.getState().isOnline && toastHandlers) {
      toastHandlers.onOffline();
    }
    return;
  }

  initialized = true;
  installQueryOnlineBridge();

  const navigatorOnline = readNavigatorOnline();
  useNetworkStore.getState().setOnline(navigatorOnline);
  onlineManager.setOnline(navigatorOnline);

  handleOnline = () => {
    failStreak = 0;
    clearPollTimer();
    queueSync(true);
  };
  handleOffline = () => {
    failStreak = FAIL_STREAK_TO_OFFLINE;
    clearPollTimer();
    applyOnline(false, true);
    scheduleNextPoll(OFFLINE_POLL_MS);
  };
  handleVisibility = () => {
    if (document.visibilityState === 'hidden') {
      clearPollTimer();
      return;
    }
    queueSync(true);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('visibilitychange', handleVisibility);

  if (!navigatorOnline) {
    failStreak = FAIL_STREAK_TO_OFFLINE;
    if (toastHandlers) toastHandlers.onOffline();
    scheduleNextPoll(OFFLINE_POLL_MS);
  } else {
    queueSync(Boolean(toastHandlers));
  }
}

/** Test helper — not used in product UI. */
export function __resetNetworkMonitoringForTests(): void {
  if (typeof window !== 'undefined') {
    if (handleOnline) window.removeEventListener('online', handleOnline);
    if (handleOffline) window.removeEventListener('offline', handleOffline);
    if (handleVisibility) {
      window.removeEventListener('visibilitychange', handleVisibility);
    }
  }
  handleOnline = null;
  handleOffline = null;
  handleVisibility = null;
  initialized = false;
  toastHandlers = null;
  syncInFlight = null;
  pendingResync = null;
  failStreak = 0;
  clearPollTimer();
}
