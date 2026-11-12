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
import { ReportAccessReviewDialog } from './ReportAccessReviewDialog';
import { ReportAccessRoleTabs } from './ReportAccessRoleTabs';
import { ReportAccessToolbar } from './ReportAccessToolbar';

export function ReportAccessPageClient() {
  const page = useReportAccessPage();

  return (
    <SuperAdminModuleGuard>
      <KvWorkspace
        panel={false}
        toolbar={
          <ReportAccessToolbar
            diffCount={page.diffs.length}
            matchesApproved={page.matchesApproved}
            onReset={() => void page.resetToApproved()}
            onCancel={page.cancelChanges}
            onReview={page.openReview}
          />
        }
      >
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
        ) : page.isLoading || !page.draft || !page.saved ? (
          <KvBusySurface label="در حال دریافت ماتریس دسترسی" />
        ) : (
          <KvCard padding="none" className="overflow-hidden">
            <div className="flex min-h-12 items-center justify-between gap-kv-inline border-b border-kv-border-muted px-kv-group py-kv-inline">
              <KvTypography as="h2" variant="subtitle" weight="black">
                گزارش‌های مجاز برای نقش
              </KvTypography>
              <KvTypography as="span" variant="caption" tone="muted">
                همه استان‌ها
              </KvTypography>
            </div>

            <div className="px-kv-group pt-kv-inline">
              <ReportAccessRoleTabs
                roleId={page.roleId}
                dirtyRoleIds={page.dirtyRoleIds}
                onChange={page.setRoleId}
              />
            </div>

            <KvTypography
              as="p"
              variant="caption"
              className="px-kv-group pb-kv-inline pt-kv-pair"
            >
              تغییرها روی همه‌ی استان‌ها اعمال می‌شود.
            </KvTypography>

            <ReportAccessReportRows
              roleId={page.roleId}
              saved={page.saved}
              draft={page.draft}
              provinceIds={page.provinceIds}
              onToggleReport={page.toggleReport}
              onToggleCompare={page.toggleCompare}
            />
          </KvCard>
        )}
      </KvWorkspace>

      <ReportAccessReviewDialog
        open={page.reviewOpen}
        diffs={page.diffs}
        summary={page.formatDiffSummary(page.diffs)}
        isSaving={page.isSaving}
        provinceLabel={page.provinceLabel}
        onClose={page.closeReview}
        onConfirm={() => void page.confirmSave()}
      />
    </SuperAdminModuleGuard>
  );
}
