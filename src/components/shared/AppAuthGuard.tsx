'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { AuthService } from '@/services/auth.service';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';

/**
 * Client guard under HydrationSafe: no valid session → login.
 * Render uses peek-only session; clearing happens in validateSession (rule 45).
 * UI gate only — not API authorization.
 */
export function AppAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const session = hasHydrated ? AuthService.peekSession() : null;

  useEffect(() => {
    if (!hasHydrated) return;
    const valid = AuthService.validateSession();
    if (!valid) {
      router.replace(RouteService.auth.login());
    }
  }, [hasHydrated, isAuthenticated, router]);

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
