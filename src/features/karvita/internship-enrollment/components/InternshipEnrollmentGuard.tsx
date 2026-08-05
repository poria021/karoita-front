'use client';

import { useLayoutEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';
import type { InternshipEnrollmentRole } from '@/types/internship-enrollment';

function isEnrollmentRole(
  role: string | undefined
): role is InternshipEnrollmentRole {
  return role === 'student' || role === 'skill_learner';
}

/**
 * فقط دانشجو و مهارت‌آموز به ماژول انتخاب واحد کارورزی/کارآموزی دسترسی دارند.
 */
export function InternshipEnrollmentGuard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);

  const allowed = Boolean(activeUser && isEnrollmentRole(activeUser.role));
  const shouldRedirect = Boolean(activeUser && !allowed);

  useLayoutEffect(() => {
    if (!shouldRedirect || !activeUser) return;
    router.replace(getPostLoginPath(activeUser));
  }, [shouldRedirect, activeUser, router]);

  if (!activeUser || shouldRedirect) {
    return <DashboardAccessPlaceholder />;
  }

  return <>{children}</>;
}
