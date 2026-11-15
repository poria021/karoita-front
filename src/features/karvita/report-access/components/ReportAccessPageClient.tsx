'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { SuperAdminModuleGuard } from '@/components/shared/shell/SuperAdminModuleGuard';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';

import { useReportAccessPage } from '../hooks/useReportAccessPage';
import { ReportAccessReportRows } from './ReportAccessReportRows';
import { ReportAccessRoleTabs } from './ReportAccessRoleTabs';

export function ReportAccessPageClient() {
  const page = useReportAccessPage();

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
          <KvCard padding="none" className="overflow-hidden">
            <div className="flex min-h-12 items-center justify-between gap-kv-inline border-b border-kv-border-muted px-kv-group py-kv-inline">
              <div className="flex min-w-0 items-center gap-kv-pair">
                <KvTypography as="h2" variant="subtitle" weight="black">
                  گزارش‌های مجاز برای نقش
                </KvTypography>
              </div>
            </div>

            <div className="px-kv-group pt-kv-inline">
              <ReportAccessRoleTabs
                roleId={page.roleId}
                roles={page.roles}
                onChange={page.setRoleId}
              />
            </div>

            <KvTypography
              as="p"
              variant="caption"
              className="px-kv-group pb-kv-inline pt-kv-pair"
            >
              {page.canEdit
                ? 'هر تغییر سوییچ بلافاصله ثبت می‌شود. گزارش‌های پیش‌فرض همیشه فعال‌اند و گزارش‌های دارای خط تیره برای این نقش قابل اعطا نیستند.'
                : 'فقط مدیر ارشد می‌تواند دسترسی‌ها را تغییر دهد.'}
            </KvTypography>

            <ReportAccessReportRows
              roleId={page.roleId}
              rowBySlug={page.rowBySlug}
              canEdit={page.canEdit}
              isPending={page.isPending}
              onToggleReport={(slug) => void page.toggleReport(slug)}
            />
          </KvCard>
        )}
      </KvWorkspace>
    </SuperAdminModuleGuard>
  );
}
