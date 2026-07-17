'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import HydrationSafe from '@/components/shared/HydrationSafe';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';

/**
 * Legacy `/profile/identity` bookmark — forwards to the role-scoped Karvita profile.
 */
export default function LegacyProfileIdentityPage() {
  return (
    <HydrationSafe>
      <LegacyProfileRedirect />
    </HydrationSafe>
  );
}

function LegacyProfileRedirect() {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);

  useEffect(() => {
    if (!activeUser) {
      router.replace(RouteService.auth.login());
      return;
    }
    router.replace(RouteService.karvita.profile(activeUser.role));
  }, [activeUser, router]);

  return (
    <div className="min-h-40 w-full bg-transparent" aria-busy="true" />
  );
}
