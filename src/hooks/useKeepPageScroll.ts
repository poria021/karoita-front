'use client';

import { useLayoutEffect } from 'react';

import {
  acquireKeepPageScroll,
  refreshKeepPageScroll,
  releaseKeepPageScroll,
} from '@/hooks/keepPageScroll';

/**
 * سلکت Radix اسکرول صفحه را با استایل !important قفل می‌کند؛ CSS فایل به آن نمی‌رسد.
 * فقط وقتی Content واقعاً در DOM است (باز) mount شود.
 */
export function useKeepPageScroll() {
  useLayoutEffect(() => {
    acquireKeepPageScroll();
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      refreshKeepPageScroll();
      inner = window.requestAnimationFrame(refreshKeepPageScroll);
    });
    return () => {
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
      releaseKeepPageScroll();
    };
  }, []);
}

export function KeepPageScrollOnMount() {
  useKeepPageScroll();
  return null;
}
