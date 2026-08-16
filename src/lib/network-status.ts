/**
 * Project-wide browser connectivity monitor (passive, CSP-safe, event-driven).
 *
 * Strategy:
 * - Pure browser event-driven (`online` / `offline` events + `navigator.onLine`).
 * - Zero background polling pings to avoid CSP blocks, battery drain, and false alarms.
 * - Bridges directly with Zustand (`useNetworkStore`) and TanStack Query (`onlineManager`).
 */

import { onlineManager } from '@tanstack/react-query';

import { useNetworkStore } from '@/store/useNetworkStore';

export const NETWORK_OFFLINE_TOAST_ID = 'karvita-network-offline';
export const NETWORK_ONLINE_TOAST_ID = 'karvita-network-online';

type NetworkToastHandlers = {
  onOffline: () => void;
  onOnline: () => void;
};

let initialized = false;
let toastHandlers: NetworkToastHandlers | null = null;
let handleOnline: (() => void) | null = null;
let handleOffline: (() => void) | null = null;
let rqListenerInstalled = false;

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

function installQueryOnlineBridge() {
  if (rqListenerInstalled) return;
  rqListenerInstalled = true;
  // Query will be kept in sync by applyOnline
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

  const isOnline = readNavigatorOnline();
  useNetworkStore.getState().setOnline(isOnline);
  onlineManager.setOnline(isOnline);

  handleOnline = () => {
    applyOnline(true, true);
  };

  handleOffline = () => {
    applyOnline(false, true);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  if (!isOnline && toastHandlers) {
    toastHandlers.onOffline();
  }
}

/** Test helper — not used in product UI. */
export function __resetNetworkMonitoringForTests(): void {
  if (typeof window !== 'undefined') {
    if (handleOnline) window.removeEventListener('online', handleOnline);
    if (handleOffline) window.removeEventListener('offline', handleOffline);
  }
  handleOnline = null;
  handleOffline = null;
  initialized = false;
  toastHandlers = null;
  rqListenerInstalled = false;
}
