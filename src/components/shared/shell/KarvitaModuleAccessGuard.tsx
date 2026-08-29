'use client';

import { useLayoutEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import { isAdminControlPlanePath } from '@/lib/live-nav-paths';
import { getPostLoginPath } from '@/services/post-login-path';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/auth';
import {
  areKarvitaModulesUnlocked,
  canAccessAdminControlPlane,
  isStaffAdminRole,
} from '@/utils/RoleStrategyMap';

function isProfilePath(pathname: string, role: string): boolean {
  const profilePath = RouteService.karvita.profile(role);
  return pathname === profilePath || pathname.startsWith(`${profilePath}/`);
}

function resolveKarvitaRedirect(
  user: User,
  pathname: string
): string | null {
  if (!areKarvitaModulesUnlocked(user) && !isProfilePath(pathname, user.role)) {
    return RouteService.karvita.profile(user.role);
  }

  const userDashboard = RouteService.karvita.dashboard();
  if (isStaffAdminRole(user.role) && pathname === userDashboard) {
    return getPostLoginPath(user);
  }
  if (
    isAdminControlPlanePath(pathname) &&
    !canAccessAdminControlPlane(user.role, pathname)
  ) {
    return getPostLoginPath(user);
  }

  return null;
}

export function KarvitaModuleAccessGuard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const activeUser = useUserStore((state) => state.activeUser);

  const redirectTo = activeUser
    ? resolveKarvitaRedirect(activeUser, pathname)
    : null;

  useLayoutEffect(() => {
    if (!redirectTo) return;
    router.replace(redirectTo);
  }, [redirectTo, router]);

  if (!activeUser || redirectTo) {
    return <DashboardAccessPlaceholder />;
  }

  return <>{children}</>;
}
