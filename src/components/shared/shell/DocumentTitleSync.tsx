'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

import { resolveBrowserTabTitle } from '@/lib/document-title';
import { useUserStore } from '@/store/useUserStore';

/** `Next` هنگام ناوبار نرم ممکن است لحظه‌ای عنوان انگلیسی سگمنت را نشان دهد. */
const TITLE_GUARD_MS = 750;

/**
 * عنوان تب مرورگر را در ناوبار کلاینت هم‌گام می‌کند — قبل از رسیدن metadata RSC.
 * همان resolver سمت سرور.
 */
export function DocumentTitleSync() {
  const pathname = usePathname();
  const role = useUserStore((state) => state.activeUser?.role ?? null);

  useLayoutEffect(() => {
    const desired = resolveBrowserTabTitle(pathname, role);
    let active = true;

    const commit = () => {
      if (active) document.title = desired;
    };

    commit();

    const titleEl = document.querySelector('title');
    const observer =
      titleEl &&
      new MutationObserver(() => {
        if (active && document.title !== desired) {
          document.title = desired;
        }
      });

    if (titleEl && observer) {
      observer.observe(titleEl, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    const raf = requestAnimationFrame(commit);

    const stopGuard = window.setTimeout(() => {
      observer?.disconnect();
    }, TITLE_GUARD_MS);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.clearTimeout(stopGuard);
    };
  }, [pathname, role]);

  return null;
}
