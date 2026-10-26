'use client';

import { useEffect } from 'react';

import { isMockApiMode } from '@/lib/api-mode';
import {
  nextAccessRefreshDelayMs,
  shouldWarmAccessToken,
} from '@/lib/session-keep-alive';
import { rotateRealAccessToken } from '@/services/api-token';
import { AuthService } from '@/services/auth.service';
import { getRuntimeAuthBoot } from '@/store/sessionBoot';

/**
 * بعد از idle تب، access را پیش‌دستانه refresh می‌کند تا کلیک ماژول
 * روی صف ۴۰۱→refresh→retry گیر نکند. فقط real + boot احراز‌شده.
 */
export function SessionKeepAlive() {
  useEffect(() => {
    if (isMockApiMode()) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const clearTimer = () => {
      if (timer == null) return;
      clearTimeout(timer);
      timer = null;
    };

    const scheduleNext = () => {
      if (cancelled) return;
      clearTimer();
      const delay = nextAccessRefreshDelayMs(
        AuthService.msUntilAccessRefreshNeeded()
      );
      if (delay == null) return;
      timer = setTimeout(() => {
        void warm().then(scheduleNext);
      }, delay);
    };

    const warm = async () => {
      if (cancelled) return;
      if (
        !shouldWarmAccessToken({
          boot: getRuntimeAuthBoot(),
          msUntilRefresh: AuthService.msUntilAccessRefreshNeeded(),
          visibilityState: document.visibilityState,
        })
      ) {
        scheduleNext();
        return;
      }
      // rotate مشترک با resolveBearerToken — نه AuthService.refreshAccessToken
      await rotateRealAccessToken();
    };

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      void warm().then(scheduleNext);
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) onVisible();
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    window.addEventListener('pageshow', onPageShow);
    onVisible();

    return () => {
      cancelled = true;
      clearTimer();
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  return null;
}
