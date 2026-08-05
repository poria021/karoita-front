'use client';

import { useSyncExternalStore } from 'react';

function getOnlineSnapshot(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true;
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener('online', onStoreChange);
  window.addEventListener('offline', onStoreChange);
  return () => {
    window.removeEventListener('online', onStoreChange);
    window.removeEventListener('offline', onStoreChange);
  };
}

/**
 * Browser online/offline (navigator.onLine + window events).
 * SSR / first paint assume online to avoid hydration mismatch.
 */
export function useNetworkOnline(): boolean {
  return useSyncExternalStore(subscribe, getOnlineSnapshot, getServerSnapshot);
}
