'use client';

import { Suspense, useEffect, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
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

  if (!hasHydrated || !session || !isAuthenticated) {
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
