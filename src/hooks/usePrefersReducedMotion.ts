'use client';

import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * خواندن ترجیح کاهش حرکت از طریق useSyncExternalStore — الگوی پیشنهادی React
 * برای منابع خارجی مثل matchMedia، بدون setState-in-effect و بدون hydration mismatch.
 * getServerSnapshot در SSR مقدار امن (بدون کاهش حرکت) برمی‌گرداند.
 */
function subscribe(notify: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}
function read(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
function readServer(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, read, readServer);
}
