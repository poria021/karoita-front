'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvSheet,
  KvSheetBody,
  KvSheetClose,
  KvSheetContent,
  KvSheetDescription,
  KvSheetFooter,
  KvSheetHeader,
  KvSheetTitle,
} from '@/components/shared/KvSheet';
import { FILTER_LABELS } from '@/features/karvita/reports/constants';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import { ReportSearchableFilterField } from '@/features/karvita/reports/components/ReportSearchableFilterField';
import { useIsTabletUp } from '@/hooks/useMediaQuery';
import { faIcons } from '@/utils/iconMap';

type ReportAdvancedFiltersProps = {
  page: AdminReportPageModel;
};

/**
 * فیلتر پیشرفته — هم‌ساخت با ماکت `rp-drawer`؛ فیلدها سلکت سرچ‌پذیر.
 * زیر `md` باتم‌شیت تمام‌عرض (نیمهٔ پایین صفحه)، از `md` به بالا کشوی کناری.
 */
export function ReportAdvancedFilters({ page }: ReportAdvancedFiltersProps) {
  // موبایل: باتم‌شیت از پایین تا نیمهٔ صفحه؛ تبلت و دسکتاپ: کشوی کناری.
  const isMobile = !useIsTabletUp();

  return (
    <KvSheet open={page.advOpen} onOpenChange={(o) => page.setAdvOpen(o)}>
      <KvSheetContent
        side={isMobile ? 'bottom' : 'left'}
        showCloseButton={false}
      >
        <KvSheetHeader>
          <div className="min-w-0">
            <KvSheetTitle>فیلتر پیشرفته</KvSheetTitle>
            <KvSheetDescription>{page.def.title}</KvSheetDescription>
          </div>
          <KvSheetClose />
        </KvSheetHeader>
        <KvSheetBody className="overflow-x-hidden overflow-y-auto">
          {page.advKeys.map((key) => (
            <ReportSearchableFilterField
              key={key}
              label={FILTER_LABELS[key]}
              value={page.filters[key] ?? ''}
              options={page.filterOptions[key] ?? []}
              onChange={(next) => page.setFilter(key, next)}
            />
          ))}
        </KvSheetBody>
        <KvSheetFooter
          style={
            isMobile
              ? { paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }
              : undefined
          }
        >
          <KvButton
            type="button"
            fullWidth
            icon={<FaIcon icon={faIcons.check} size="sm" />}
            onClick={() => page.setAdvOpen(false)}
          >
            تأیید و اعمال فیلترها
          </KvButton>
          <KvButton
            type="button"
            appearance="secondary"
            color="neutral"
            fullWidth
            onClick={page.clearFilters}
          >
            پاک کردن فیلترها
          </KvButton>
        </KvSheetFooter>
      </KvSheetContent>
    </KvSheet>
  );
}
