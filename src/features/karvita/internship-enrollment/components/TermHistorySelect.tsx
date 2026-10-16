'use client';

import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import type { InternshipEnrollmentTermHistoryEntry } from '@/types/internship-enrollment';
import { toPersianDigits } from '@/utils/persianDigits';

function termStatusSuffix(term: InternshipEnrollmentTermHistoryEntry): string {
  if (term.status === 'dropped') return ' (حذف‌شده)';
  if (term.status !== 'completed') return '';
  if (term.outcome === 'passed') return ' (قبول)';
  if (term.outcome === 'failed') return ' (مردود)';
  return ' (پایان‌یافته)';
}

/**
 * سلکت‌باکس نیم‌سال — همیشه نمایش داده می‌شود؛ وقتی تاریخچه فقط یک نیم‌سال
 * دارد دیزیبل است (که وجودش معلوم باشد)، و با دو یا چند نیم‌سال فعال می‌شود.
 */
export function TermHistorySelect({
  termHistory,
  selectedTermId,
  onSelectTerm,
}: {
  termHistory: InternshipEnrollmentTermHistoryEntry[];
  selectedTermId: string;
  onSelectTerm: (termId: string) => void;
}) {
  if (termHistory.length === 0) return null;
  const isDisabled = termHistory.length <= 1;

  return (
    <div className="w-full sm:w-56">
      <KvSelect
        value={selectedTermId}
        onValueChange={onSelectTerm}
        disabled={isDisabled}
      >
        <KvSelectTrigger aria-label="نیم‌سال تحصیلی">
          <KvSelectValue placeholder="نیم‌سال تحصیلی" />
        </KvSelectTrigger>
        <KvSelectContent>
          {termHistory.map((term) => (
            <KvSelectItem key={term.termId} value={term.termId}>
              {toPersianDigits(term.termTitle)}
              {termStatusSuffix(term)}
            </KvSelectItem>
          ))}
        </KvSelectContent>
      </KvSelect>
    </div>
  );
}
