'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import HydrationSafe from '@/components/shared/HydrationSafe';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';

/**
 * Legacy `/profile/security` bookmark — forwards to role profile security tab.
 */
export default function LegacyProfileSecurityPage() {
  return (
    <HydrationSafe>
      <LegacyProfileSecurityRedirect />
    </HydrationSafe>
  );
}

function LegacyProfileSecurityRedirect() {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);

  useEffect(() => {
    if (!activeUser) {
      router.replace(RouteService.auth.login());
      return;
    }
    router.replace(RouteService.karvita.profileSecurity(activeUser.role));
  }, [activeUser, router]);

  return (
    <div className="min-h-40 w-full bg-transparent" aria-busy="true" />
  );
}
