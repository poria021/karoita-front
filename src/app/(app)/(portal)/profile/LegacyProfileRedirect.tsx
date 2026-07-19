'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';

/**
 * Client redirect leaf for legacy `/profile/*` bookmarks.
 * Parent `(app)` layout already gates with HydrationSafe — do not nest another.
 */
export function LegacyProfileRedirect({
  target,
}: {
  target: 'identity' | 'security';
}) {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);

  useEffect(() => {
    if (!activeUser) {
      router.replace(RouteService.auth.login());
      return;
    }
    router.replace(
      target === 'security'
        ? RouteService.karvita.profileSecurity(activeUser.role)
        : RouteService.karvita.profile(activeUser.role)
    );
  }, [activeUser, router, target]);

  return (
    <div className="min-h-40 w-full bg-transparent" aria-busy="true" />
  );
}
