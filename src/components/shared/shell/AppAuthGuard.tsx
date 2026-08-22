'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import { IS_MOCK_MODE } from '@/lib/api-mode';
import { AuthService } from '@/services/auth.service';
import { RouteService } from '@/services/route.service';
import { buildLoginHref } from '@/lib/return-url';
import { useUserStore } from '@/store/useUserStore';

function AppAuthGuardInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  // Real mode keeps the access token in memory only (see
  // real-auth.tokens.ts) — a hard reload always starts this at `true`,
  // even for a still-valid session, until the httpOnly-cookie round trip
  // below resolves.
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    let cancelled = false;

    async function verify() {
      // Mock mode: session lives in sessionStorage, sync check is enough.
      // Real mode: the access token was lost on reload (memory-only by
      // design), so we must round-trip through /api/auth/refresh — which
      // reads the httpOnly `karvita_rt` cookie server-side — before we can
      // tell a "still logged in" user from a "actually logged out" one.
      const valid = IS_MOCK_MODE
        ? AuthService.validateSession()
        : await AuthService.refreshRealSession();

      if (cancelled) return;
      setCheckingSession(false);

      if (!valid) {
        const search = searchParams.toString();
        const intended = search ? `${pathname}?${search}` : pathname;
        router.replace(buildLoginHref(RouteService.auth.login(), intended));
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, pathname, router, searchParams]);

  const session = hasHydrated ? AuthService.peekSession() : null;

  if (!hasHydrated || checkingSession || !session || !isAuthenticated) {
    return <DashboardAccessPlaceholder fullViewport />;
  }

  return <>{children}</>;
}

/** Client role/session gate. Edge presence is `src/proxy.ts` (Next 16). */
export function AppAuthGuard({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardAccessPlaceholder fullViewport />}>
      <AppAuthGuardInner>{children}</AppAuthGuardInner>
    </Suspense>
  );
}
