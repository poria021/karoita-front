'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { AuthService } from '@/services/auth.service';
import { RouteService } from '@/services/route.service';
import { buildLoginHref } from '@/lib/return-url';
import { useUserStore } from '@/store/useUserStore';

/**
 * Client guard under HydrationSafe: no valid session → login (+ safe returnUrl).
 * Render uses peek-only session; clearing happens in validateSession (rule 45).
 * UI gate only — not API authorization.
 */
export function AppAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const session = hasHydrated ? AuthService.peekSession() : null;

  useEffect(() => {
    if (!hasHydrated) return;
    const valid = AuthService.validateSession();
    if (!valid) {
      const search = searchParams.toString();
      const intended = search ? `${pathname}?${search}` : pathname;
      router.replace(buildLoginHref(RouteService.auth.login(), intended));
    }
  }, [hasHydrated, isAuthenticated, pathname, router, searchParams]);

  if (!hasHydrated) {
    return (
      <div
        className="min-h-dvh w-full bg-kv-canvas"
        aria-busy="true"
        aria-live="polite"
      />
    );
  }

  if (!session) {
    return (
      <div
        className="min-h-dvh w-full bg-kv-canvas"
        aria-busy="true"
        aria-live="polite"
      />
    );
  }

  return <>{children}</>;
}
