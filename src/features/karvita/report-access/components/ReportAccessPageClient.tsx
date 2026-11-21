'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { useRegisterPageRefresh } from '@/components/shared/shell/PageRefreshContext';
import { SuperAdminModuleGuard } from '@/components/shared/shell/SuperAdminModuleGuard';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';

import { useReportAccessPage } from '../hooks/useReportAccessPage';
import { ReportAccessReportRows } from './ReportAccessReportRows';
import { ReportAccessRoleTabs } from './ReportAccessRoleTabs';

export function ReportAccessPageClient() {
  const page = useReportAccessPage();
  useRegisterPageRefresh(page.reload);

  return (
    <SuperAdminModuleGuard>
      <KvWorkspace panel={false}>
        {page.error ? (
          <KvAlert
            variant="error"
            title="بارگذاری دسترسی گزارش‌ها ناموفق بود"
            description={page.error}
            actions={
              <KvButton
                type="button"
                appearance="secondary"
                size="sm"
                onClick={() => void page.reload()}
              >
                تلاش مجدد
              </KvButton>
            }
          />
        ) : page.isLoading || !page.roles.length ? (
          <KvBusySurface label="در حال دریافت ماتریس دسترسی" />
        ) : (
          <div className="flex min-w-0 flex-col gap-kv-region">
            {/* تب‌های نقش بیرون از کارت؛ کارت فقط محتوای گزارش‌هاست. */}
            <ReportAccessRoleTabs
              roleId={page.roleId}
              roles={page.roles}
              onChange={page.setRoleId}
            />

            <KvCard padding="none" className="overflow-hidden rounded-kv-shell shadow-none">
              <ReportAccessReportRows
                roleId={page.roleId}
                rowBySlug={page.rowBySlug}
                canEdit={page.canEdit}
                isPending={page.isPending}
                onToggleReport={(slug) => void page.toggleReport(slug)}
              />
            </KvCard>
          </div>
        )}
      </KvWorkspace>
    </SuperAdminModuleGuard>
  );
}
