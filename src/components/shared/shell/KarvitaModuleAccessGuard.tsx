'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { isAdminControlPlanePath } from '@/lib/live-nav-paths';
import { getPostLoginPath, isSuperAdminRole } from '@/services/post-login-path';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/auth';
import { areKarvitaModulesUnlocked } from '@/utils/RoleStrategyMap';

function isProfilePath(pathname: string, role: string): boolean {
  const profilePath = RouteService.karvita.profile(role);
  return pathname === profilePath || pathname.startsWith(`${profilePath}/`);
}

/**
 * Single karvita client gate: approval lock + role home (rule 45 flash budget).
 * UX only — forged Zustand roles are not authorization.
 */
function resolveKarvitaRedirect(
  user: User,
  pathname: string
): string | null {
  if (!areKarvitaModulesUnlocked(user) && !isProfilePath(pathname, user.role)) {
    return RouteService.karvita.profile(user.role);
  }

  const userDashboard = RouteService.karvita.dashboard();
  if (isSuperAdminRole(user.role) && pathname === userDashboard) {
    return getPostLoginPath(user);
  }
  if (!isSuperAdminRole(user.role) && isAdminControlPlanePath(pathname)) {
    return userDashboard;
  }

  return null;
}

function GatePlaceholder() {
  return (
    <div
      className="min-h-dvh w-full bg-kv-canvas"
      aria-busy="true"
      aria-live="polite"
    />
  );
}

/**
 * Keeps unapproved users on profile and super_admin on the admin plane.
 * Admin modules live under `/karvita/admin/*` so this prefix gate covers them.
 * Replaces the former RoleHome + ModuleAccess stack (one redirect hop).
 */
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

  useEffect(() => {
    if (!redirectTo) return;
    router.replace(redirectTo);
  }, [redirectTo, router]);

  if (!activeUser || redirectTo) {
    return <GatePlaceholder />;
  }

  return <>{children}</>;
}
