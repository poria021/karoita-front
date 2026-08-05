'use client';

import { useLayoutEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import { isAdminControlPlanePath } from '@/lib/live-nav-paths';
import { getPostLoginPath, isSuperAdminRole } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';

/**
 * Guards admin control-plane routes; redirects non-super-admins to appropriate dashboard.
 * Used for module pages that require super-admin access.
 */
export function SuperAdminModuleGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeUser = useUserStore((state) => state.activeUser);

  const shouldRedirect =
    activeUser && !isSuperAdminRole(activeUser.role) && isAdminControlPlanePath(pathname);

  useLayoutEffect(() => {
    if (!shouldRedirect) return;
    if (activeUser) {
      router.replace(getPostLoginPath(activeUser));
    }
  }, [shouldRedirect, activeUser, router]);

  if (!activeUser || shouldRedirect) {
    return <DashboardAccessPlaceholder />;
  }

  return <>{children}</>;
}
