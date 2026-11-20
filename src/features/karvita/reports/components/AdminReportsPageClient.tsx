'use client';

import { useLayoutEffect, useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import { SuperAdminModuleGuard } from '@/components/shared/shell/SuperAdminModuleGuard';
import { useOrgReportAccess } from '@/features/karvita/reports/hooks/useOrgReportAccess';
import {
  extraReportFilterKeysForRole,
  hiddenReportFilterKeysForRole,
} from '@/features/karvita/reports/lib/org-report-access';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';
import { isStaffAdminRole } from '@/types/role-taxonomy';
import type { ReportSlug } from '@/types/report-access';

import { ReportsPageView } from './ReportsPageView';

function AdminReportsAccessGuard({
  slug,
  children,
}: {
  slug: ReportSlug;
  children: ReactNode;
}) {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);
  const access = useOrgReportAccess();

  const roleOk = Boolean(activeUser && isStaffAdminRole(activeUser.role));
  const waiting = roleOk && access.isLoading;
  const allowed = roleOk && !waiting && access.canAccessSlug(slug);
  const shouldRedirect = Boolean(activeUser && roleOk && !waiting && !allowed);
  const denyRole = Boolean(activeUser && !roleOk);

  useLayoutEffect(() => {
    if ((!shouldRedirect && !denyRole) || !activeUser) return;
    router.replace(getPostLoginPath(activeUser));
  }, [activeUser, denyRole, router, shouldRedirect]);

  // تا وقتی ماتریس دسترسی settle شود، خودِ صفحهٔ گزارش (اسپینر جدول)
  // نشان داده می‌شود — نه دوبارهٔ لودر برند داخل main.
  if (!activeUser || denyRole || shouldRedirect) {
    return <DashboardAccessPlaceholder />;
  }

  return <>{children}</>;
}

type AdminReportsPageClientProps = {
  slug: ReportSlug;
};

/**
 * گزارش‌گیری پنل ادمین — دسترسی صفحه از `GET /reports/access/me`
 * (فقط `status=active`؛ inactive و غایب ممنوع).
 */
export function AdminReportsPageClient({ slug }: AdminReportsPageClientProps) {
  const role = useUserStore((state) => state.activeUser?.role);
  const pageOptions = useMemo(
    () => ({
      hiddenFilterKeys: hiddenReportFilterKeysForRole(role, slug),
      extraFilterKeys: extraReportFilterKeysForRole(role, slug),
    }),
    [role, slug]
  );

  return (
    <SuperAdminModuleGuard>
      <AdminReportsAccessGuard slug={slug}>
        <ReportsPageView
          slug={slug}
          showCategoryNav
          pageOptions={pageOptions}
        />
      </AdminReportsAccessGuard>
    </SuperAdminModuleGuard>
  );
}
