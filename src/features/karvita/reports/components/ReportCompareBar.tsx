"use client";

import { KvButton } from "@/components/shared/KvButton";
import { KvTypography } from "@/components/shared/KvTypography";
import type { AdminReportPageModel } from "@/features/karvita/reports/hooks/useAdminReportPage";
import { toPersianDigits } from "@/utils/persianDigits";

type ReportCompareBarProps = {
  page: AdminReportPageModel;
};

/**
 * باکس کوچک انتخاب برای مقایسه — داخل نوار ابزار، جای دکمه‌های مقایسه/PDF/اکسل.
 * فقط «n از max» + «انصراف» + «تأیید و مقایسه»؛ متن راهنما فقط به‌صورت tooltip است.
 * فقط بعد از زدن «مقایسه» (حالت انتخاب) دیده می‌شود.
 */
export function ReportCompareBar({ page }: ReportCompareBarProps) {
  if (!page.canCompare || page.compareMode || !page.compareSelecting) {
    return null;
  }

  const n = page.compareSelected.length;
  const full = n >= page.compareMax;
  const canSelectAll =
    page.rows.length > 0 && n < Math.min(page.compareMax, page.rows.length);
  const help =
    n === 0
      ? `مواردی را که می‌خواهید مقایسه کنید انتخاب کنید (از ${toPersianDigits(page.compareMin)} تا ${toPersianDigits(page.compareMax)} مورد).`
      : n < page.compareMin
        ? `برای مقایسه حداقل ${toPersianDigits(page.compareMin)} مورد لازم است.`
        : full
          ? `به سقف ${toPersianDigits(page.compareMax)} مورد رسیده‌اید؛ برای افزودن مورد دیگر، یکی را بردارید.`
          : `می‌توانید تا ${toPersianDigits(page.compareMax - n)} مورد دیگر اضافه کنید.`;

  return (
    <div
      className="flex h-11 items-center gap-kv-inline rounded-kv-control bg-kv-surface/70 px-kv-inline lg:ms-auto"
      title={help}
    >
      <KvTypography
        as="span"
        variant="caption"
        tone="muted"
        className="me-kv-inline whitespace-nowrap px-1 font-bold tabular-nums"
        aria-live="polite"
      >
        موارد انتخابی {toPersianDigits(n)} از {toPersianDigits(page.compareMax)}
      </KvTypography>
      {canSelectAll ? (
        <KvButton
          type="button"
          size="sm"
          appearance="ghost"
          color="neutral"
          className="max-lg:min-h-11"
          onClick={page.selectAllCompareRows}
        >
          انتخاب همه
        </KvButton>
      ) : null}
      <KvButton
        type="button"
        size="sm"
        appearance="secondary"
        color="neutral"
        className="max-lg:min-h-11"
        onClick={page.cancelCompareSelection}
      >
        انصراف
      </KvButton>
      <KvButton
        type="button"
        size="sm"
        disabled={n < page.compareMin}
        className="max-lg:min-h-11"
        onClick={() => page.enterCompare()}
      >
        تأیید و مقایسه
      </KvButton>
    </div>
  );
}
