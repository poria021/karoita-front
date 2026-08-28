'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';
import { isAppShellPath, RouteService } from '@/services/route.service';
import {
  clearAuthTransition,
  runAfterPaint,
  useAuthTransitionPhase,
} from '@/store/authTransition';

function normalizePath(pathname: string): string {
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

function isDashboardSettlePath(pathname: string): boolean {
  if (!isAppShellPath(pathname)) return false;
  return normalizePath(pathname) !== RouteService.karvita.entry();
}

/**
 * Full-viewport brand loader for auth-boundary transitions only
 * (login → dashboard, logout → marketing). Never used for in-dashboard
 * module or tab switches.
 */
export function AuthTransitionOverlay() {
  const phase = useAuthTransitionPhase();
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (phase === 'idle') return;

    if (phase === 'entering') {
      if (!isDashboardSettlePath(pathname)) return;
      return runAfterPaint(clearAuthTransition);
    }

    if (isAppShellPath(pathname)) return;
    return runAfterPaint(clearAuthTransition);
  }, [phase, pathname]);

  if (phase === 'idle') return null;

  return (
    <div className="fixed inset-0 z-[200]">
      <KvBrandLinearLoader
        fullViewport
        label={
          phase === 'leaving'
            ? 'در حال خروج از حساب کاربری…'
            : 'لطفا منتظر بمانید…'
        }
      />
    </div>
  );
}
