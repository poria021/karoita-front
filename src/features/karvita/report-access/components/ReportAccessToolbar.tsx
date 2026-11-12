'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvButtonGroup } from '@/components/shared/KvButtonGroup';
import { KvTypography } from '@/components/shared/KvTypography';
import { toPersianDigits } from '@/utils/persianDigits';
import { faIcons } from '@/utils/iconMap';

type ReportAccessToolbarProps = {
  diffCount: number;
  matchesApproved: boolean;
  onReset: () => void;
  onCancel: () => void;
  onReview: () => void;
};

export function ReportAccessToolbar({
  diffCount,
  matchesApproved,
  onReset,
  onCancel,
  onReview,
}: ReportAccessToolbarProps) {
  return (
    <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-kv-inline rounded-kv-panel border border-kv-border bg-kv-surface/95 px-kv-group py-kv-inline shadow-kv-soft backdrop-blur-md supports-[backdrop-filter]:bg-kv-surface/85">
      <div className="flex min-w-0 flex-col gap-kv-micro">
        <div role="status" aria-live="polite">
          <KvTypography as="span" variant="subtitle">
            {diffCount
              ? `${toPersianDigits(diffCount)} گزارش تغییر کرده و هنوز ثبت نشده است`
              : 'تغییر ثبت‌نشده‌ای وجود ندارد'}
          </KvTypography>
        </div>
        <KvTypography as="span" variant="caption" tone="muted">
          تغییرها پس از بازبینی و «ثبت نهایی تغییرات» روی منوی کاربران هر نقش
          اعمال می‌شود.
        </KvTypography>
      </div>
      <div className="w-full sm:w-auto">
        <KvButtonGroup fullWidth>
          <KvButton
            type="button"
            appearance="secondary"
            color="neutral"
            size="sm"
            disabled={matchesApproved}
            title="برگرداندن همه‌ی نقش‌ها و استان‌ها به تنظیمات سند مصوب"
            icon={<FaIcon icon={faIcons.arrowsRotate} size="sm" />}
            onClick={onReset}
          >
            بازنشانی به سند
          </KvButton>
          <KvButton
            type="button"
            appearance="secondary"
            color="neutral"
            size="sm"
            disabled={!diffCount}
            onClick={onCancel}
          >
            لغو تغییرات
          </KvButton>
          <KvButton
            type="button"
            size="sm"
            disabled={!diffCount}
            icon={<FaIcon icon={faIcons.check} size="sm" />}
            onClick={onReview}
          >
            بازبینی تغییرات
          </KvButton>
        </KvButtonGroup>
      </div>
    </div>
  );
}
