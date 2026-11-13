'use client';

import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { SelectionChip } from '@/components/shared/fields/organization-select/SelectionChip';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import { toPersianDigits } from '@/utils/persianDigits';

type ReportCompareBarProps = {
  page: AdminReportPageModel;
};

export function ReportCompareBar({ page }: ReportCompareBarProps) {
  if (!page.canCompare || page.compareMode || !page.compareSelected.length) {
    return null;
  }

  const n = page.compareSelected.length;
  const full = n >= page.compareMax;
  const help =
    n < page.compareMin
      ? `برای مقایسه حداقل ${toPersianDigits(page.compareMin)} مورد لازم است.`
      : full
        ? `به سقف ${toPersianDigits(page.compareMax)} مورد رسیده‌اید؛ برای افزودن مورد دیگر، یکی را بردارید.`
        : `می‌توانید تا ${toPersianDigits(page.compareMax - n)} مورد دیگر اضافه کنید.`;

  const names = page.compareSelected.map((id) => {
    const row = page.rows.find((r) => r.id === id);
    return { id, name: String(row?.name ?? id) };
  });

  return (
    <div className="sticky bottom-kv-group z-[8] mt-kv-group flex flex-wrap items-center gap-kv-inline rounded-kv-panel border border-kv-brand-border bg-kv-surface px-kv-group py-kv-inline shadow-kv-floating">
      <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-kv-pair">
        <KvTypography as="span" variant="caption">
          {help}
        </KvTypography>
        <div className="flex min-w-0 flex-wrap gap-kv-pair">
          {names.map((item) => (
            <SelectionChip
              key={item.id}
              label={item.name}
              onRemove={() => page.toggleCompareSelect(item.id)}
            />
          ))}
        </div>
      </div>
      <div className="flex w-full items-center gap-kv-pair sm:ms-auto sm:w-auto">
        <KvButton
          type="button"
          appearance="secondary"
          color="neutral"
          className="flex-1 max-sm:min-h-11 sm:flex-none"
          onClick={page.clearCompareSelected}
        >
          پاک کردن
        </KvButton>
        <KvButton
          type="button"
          disabled={n < page.compareMin}
          className="flex-1 max-sm:min-h-11 sm:flex-none"
          onClick={() => page.enterCompare()}
        >
          مقایسه‌ی {toPersianDigits(n)} مورد
        </KvButton>
      </div>
    </div>
  );
}
