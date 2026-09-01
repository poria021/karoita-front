'use client';

import { useEffect } from 'react';

import { reportClientEvent } from '@/lib/observability/reportClientEvent';
import { reportError } from '@/lib/observability/reportError';

/** کرش کلاینت + بیکن اختیاری page-view. چیزی رندر نمی‌کند. */
export function ObservabilityBoot() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      void reportError(event.error ?? event.message, {
        source: 'window.error',
        path: window.location.pathname,
      });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      void reportError(event.reason, {
        source: 'unhandledrejection',
        path: window.location.pathname,
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    reportClientEvent('page_view');

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
