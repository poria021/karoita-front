'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';
import { areKarvitaModulesUnlocked } from '@/utils/RoleStrategyMap';

function isProfilePath(pathname: string, role: string): boolean {
  const profilePath = RouteService.karvita.profile(role);
  return pathname === profilePath || pathname.startsWith(`${profilePath}/`);
}

/**
 * Keeps unapproved users on the profile workspace until admin approval
 * (original-karvita.html module gate). Profile itself stays reachable.
 */
export function KarvitaModuleAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const activeUser = useUserStore((state) => state.activeUser);

  useEffect(() => {
    if (!activeUser) return;
    if (areKarvitaModulesUnlocked(activeUser)) return;
    if (isProfilePath(pathname, activeUser.role)) return;

    router.replace(RouteService.karvita.profile(activeUser.role));
  }, [activeUser, pathname, router]);

  return children;
}
