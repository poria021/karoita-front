'use client';

import { KvCard } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import type {
  InternshipEnrollmentOutcome,
  InternshipEnrollmentTermHistoryEntry,
} from '@/types/internship-enrollment';

import { TermHistorySelect } from './TermHistorySelect';

export type PastTermsStatusNotice = {
  title: string;
  description: string;
};

type PastTermsCardProps = {
  terms: InternshipEnrollmentTermHistoryEntry[];
  selectedTermId: string;
  onSelectTerm: (termId: string) => void;
  /**
   * نتیجهٔ قبولی از API (`isPass` → `outcome`).
   * فقط همین کلید رنگ باکس را سبز/قرمز می‌کند.
   */
  outcome?: InternshipEnrollmentOutcome | null;
  /** پیام قبولی/مردودی به‌جای توضیح پیش‌فرض. */
  statusNotice?: PastTermsStatusNotice | null;
};

/**
 * کارت سوابق نیم‌سال — سلکت کنار عنوان؛ رنگ از `outcome` (isPass).
 */
export function PastTermsCard({
  terms,
  selectedTermId,
  onSelectTerm,
  outcome = null,
  statusNotice = null,
}: PastTermsCardProps) {
  if (terms.length === 0) return null;

  const isPassed = outcome === 'passed';
  const isFailed = outcome === 'failed';

  return (
    <KvCard
      padding="md"
      tone={isFailed ? 'danger' : 'surface'}
      className={cn(
        isPassed && 'border-kv-success-border bg-kv-success-soft shadow-none'
      )}
    >
      <div className="flex flex-col items-stretch justify-between gap-kv-group sm:flex-row sm:items-center">
        <div className="flex flex-col gap-kv-pair text-start">
          {statusNotice ? (
            <>
              <KvTypography
                variant="subtitle"
                weight="bold"
                as="h3"
                tone={isPassed ? 'success' : isFailed ? 'danger' : 'default'}
              >
                {statusNotice.title}
              </KvTypography>
              <KvTypography
                variant="caption"
                as="p"
                tone={isPassed ? 'success' : isFailed ? 'danger' : 'muted'}
              >
                {statusNotice.description}
              </KvTypography>
            </>
          ) : (
            <>
              <KvTypography variant="subtitle" weight="bold" as="h3">
                سوابق نیم‌سال‌های قبل
              </KvTypography>
              <KvTypography variant="caption" tone="muted" as="p">
                برای مشاهدهٔ گزارش‌ها و نمرات، نیم‌سال موردنظر را انتخاب کنید.
              </KvTypography>
            </>
          )}
        </div>
        <TermHistorySelect
          termHistory={terms}
          selectedTermId={selectedTermId}
          onSelectTerm={onSelectTerm}
        />
      </div>
    </KvCard>
  );
}
