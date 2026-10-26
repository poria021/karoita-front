'use client';

import { useEffect, useState } from 'react';

import {
  NAVIGATION_PROGRESS_SAFETY_HIDE_MS,
  NAVIGATION_PROGRESS_SHOW_DELAY_MS,
  resolveInternalPathNavAnchor,
} from '@/lib/navigation-progress';
import { subscribeShallowLocation } from '@/lib/shallow-location';
import { cn } from '@/lib/utils';

/**
 * نوار باریک بالای شل هنگام تعویض pathname (ماژول).
 * `usePathname` عمداً نیست — overlay سراسری با pathname موقع soft-nav suspend می‌شود.
 * تغییر فقط-query (`?tab=`) نوار را روشن نمی‌کند.
 */
export function NavigationProgress() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout> | null = null;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;
    let pendingFromPath: string | null = null;

    const clearTimers = () => {
      if (showTimer != null) {
        clearTimeout(showTimer);
        showTimer = null;
      }
      if (safetyTimer != null) {
        clearTimeout(safetyTimer);
        safetyTimer = null;
      }
    };

    const stop = () => {
      clearTimers();
      pendingFromPath = null;
      setActive(false);
    };

    const start = () => {
      pendingFromPath = window.location.pathname;
      clearTimers();
      showTimer = setTimeout(() => {
        setActive(true);
      }, NAVIGATION_PROGRESS_SHOW_DELAY_MS);
      safetyTimer = setTimeout(stop, NAVIGATION_PROGRESS_SAFETY_HIDE_MS);
    };

    const onClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = resolveInternalPathNavAnchor(
        event.target,
        window.location.origin,
        window.location.pathname
      );
      if (!anchor) return;
      start();
    };

    const onLocation = () => {
      if (pendingFromPath == null) return;
      if (window.location.pathname !== pendingFromPath) {
        stop();
      }
    };

    document.addEventListener('click', onClickCapture, true);
    const unsubscribe = subscribeShallowLocation(onLocation);

    return () => {
      clearTimers();
      document.removeEventListener('click', onClickCapture, true);
      unsubscribe();
    };
  }, []);

  return (
    <div
      aria-hidden={!active}
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden transition-opacity duration-150',
        active ? 'opacity-100' : 'opacity-0'
      )}
      data-testid="kv-navigation-progress"
      data-active={active ? 'true' : 'false'}
      role="presentation"
    >
      <div className="kv-linear-indeterminate h-full w-full bg-kv-brand/15" />
    </div>
  );
}
