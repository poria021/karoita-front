'use client';

import { useLayoutEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import { isAdminControlPlanePath } from '@/lib/live-nav-paths';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';
import { canAccessAdminControlPlane } from '@/utils/RoleStrategyMap';

/**
 * گیت ماژول‌های `/karvita/admin`. مدیر ارشد همه را می‌بیند؛
 * دستیار فقط اجرایی را می‌بیند — بدون ایجاد حساب سازمانی و تنظیمات ترم.
 */
export function SuperAdminModuleGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeUser = useUserStore((state) => state.activeUser);

  const shouldRedirect =
    activeUser &&
    isAdminControlPlanePath(pathname) &&
    !canAccessAdminControlPlane(activeUser.role, pathname);

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
