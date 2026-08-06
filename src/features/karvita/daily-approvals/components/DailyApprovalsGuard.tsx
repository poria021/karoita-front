'use client';

import { useLayoutEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';

export function DailyApprovalsGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);
  const allowed = activeUser?.role === 'supervisor_professor';
  const shouldRedirect = Boolean(activeUser && !allowed);

  useLayoutEffect(() => {
    if (!shouldRedirect || !activeUser) return;
    router.replace(getPostLoginPath(activeUser));
  }, [activeUser, router, shouldRedirect]);

  if (!activeUser || shouldRedirect) {
    return <DashboardAccessPlaceholder />;
  }

  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
}
