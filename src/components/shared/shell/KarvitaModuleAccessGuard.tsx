'use client';

import { useLayoutEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import { resolveKarvitaRedirect } from '@/components/shared/shell/resolveKarvitaRedirect';
import { useUserStore } from '@/store/useUserStore';

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
