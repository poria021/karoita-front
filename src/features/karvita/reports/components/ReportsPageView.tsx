'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import { useIsTabletUp } from '@/hooks/useMediaQuery';
import type { ReportSlug } from '@/types/report-access';

import {
  useAdminReportPage,
  type UseAdminReportPageOptions,
} from '../hooks/useAdminReportPage';
import { ReportAdvancedFilters } from './ReportAdvancedFilters';
import { ReportCardList } from './ReportCardList';
import { ReportCategoryNav } from './ReportCategoryNav';
import { ReportCompareBar } from './ReportCompareBar';
import { ReportCompareView } from './ReportCompareView';
import { ReportLearnerDialogs } from './ReportLearnerDialogs';
import { ReportPeriodBand } from './ReportPeriodBand';
import { ReportTable } from './ReportTable';
import { ReportToolbar } from './ReportToolbar';

type ReportsPageViewProps = {
  slug: ReportSlug;
  /** ناو تم‌ها روی موبایل — ادمین با ریل دوم؛ سازمانی از سایدبار گروه. */
  showCategoryNav?: boolean;
  pageOptions?: UseAdminReportPageOptions;
};

/** بدنهٔ مشترک صفحهٔ گزارش (بدون گیت نقش). */
export function ReportsPageView({
  slug,
  showCategoryNav = true,
  pageOptions,
}: ReportsPageViewProps) {
  const page = useAdminReportPage(slug, pageOptions);
  const showTable = useIsTabletUp();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {page.compareMode ? (
        <ReportCompareView page={page} />
      ) : (
        <KvWorkspace panel={false}>
          <div className="flex flex-col gap-kv-group">
            {showCategoryNav ? (
              <div className="lg:hidden">
                <ReportCategoryNav slug={slug} />
              </div>
            ) : null}
            <section
              className="flex min-w-0 flex-col gap-kv-group"
              aria-label={page.def.title}
            >
              {page.showPeriod ? <ReportPeriodBand page={page} /> : null}
              <ReportToolbar page={page} />
              {page.error ? (
                <KvAlert
                  variant="error"
                  title="بارگذاری گزارش ناموفق بود"
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
              ) : (
                // جدول از تبلت به بالا؛ فقط موبایل کارت (فقط یکی در DOM می‌نشیند).
                showTable ? (
                  <ReportTable page={page} />
                ) : (
                  <ReportCardList page={page} />
                )
              )}
              <ReportCompareBar page={page} />
            </section>
          </div>
        </KvWorkspace>
      )}

      <ReportAdvancedFilters page={page} />
      <ReportLearnerDialogs page={page} />
    </div>
  );
}
