'use client';

import { useLayoutEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import { useOrgReportAccess } from '@/features/karvita/reports/hooks/useOrgReportAccess';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';
import type { ReportSlug } from '@/types/report-access';

import { isOrgReportsRole } from '../lib/org-report-access';
import { ReportsPageView } from './ReportsPageView';

function OrgReportsGuard({
  slug,
  children,
}: {
  slug: ReportSlug;
  children: ReactNode;
}) {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);
  const access = useOrgReportAccess();

  const roleOk = Boolean(activeUser && isOrgReportsRole(activeUser.role));
  const waiting = roleOk && access.isLoading;
  const allowed =
    roleOk && !waiting && access.canAccessSlug(slug);
  const shouldRedirect = Boolean(activeUser && roleOk && !waiting && !allowed);
  const denyRole = Boolean(activeUser && !roleOk);

  useLayoutEffect(() => {
    if ((!shouldRedirect && !denyRole) || !activeUser) return;
    router.replace(getPostLoginPath(activeUser));
  }, [activeUser, denyRole, router, shouldRedirect]);

  if (!activeUser || denyRole || shouldRedirect) {
    return <DashboardAccessPlaceholder />;
  }

  if (waiting) {
    return <DashboardAccessPlaceholder />;
  }

  return <>{children}</>;
}

type OrgReportsPageClientProps = {
  slug: ReportSlug;
};

/** گزارش‌گیری نقش سازمانی — گیت و مقایسه بر اساس ماتریس دسترسی. */
export function OrgReportsPageClient({ slug }: OrgReportsPageClientProps) {
  const access = useOrgReportAccess();

  return (
    <OrgReportsGuard slug={slug}>
      <ReportsPageView
        slug={slug}
        showCategoryNav={false}
        pageOptions={{ canCompare: access.canCompareSlug(slug) }}
      />
    </OrgReportsGuard>
  );
}
