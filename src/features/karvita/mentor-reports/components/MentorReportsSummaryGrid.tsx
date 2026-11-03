'use client';

import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import type { MentorTeacherSummaryItem } from '@/types/mentor-teacher-reports';

const summaryToneClasses: Record<
  MentorTeacherSummaryItem['tone'],
  string
> = {
  brand: 'bg-kv-brand-soft text-kv-brand-soft-fg',
  success: 'bg-kv-success-soft text-kv-success',
  warning: 'bg-kv-warning-soft text-kv-warning',
  info: 'bg-kv-surface-subtle text-kv-text-secondary',
};

export function MentorReportsSummaryGrid({
  items,
}: {
  items: MentorTeacherSummaryItem[];
}) {
  return (
    <div className="grid gap-kv-group sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <KvCard key={item.label} className="h-full">
          <KvCardContent className="flex h-full flex-col gap-kv-group p-kv-group">
            <div className="flex items-center justify-between gap-kv-pair">
              <KvTypography variant="label" tone="muted" as="span">
                {item.label}
              </KvTypography>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-kv-control text-xs font-black ${summaryToneClasses[item.tone]}`}
              >
                {item.value.slice(0, 1) || '•'}
              </span>
            </div>
            <KvTypography variant="title" as="div" className="text-2xl">
              {item.value}
            </KvTypography>
            <KvTypography variant="caption" tone="muted" as="p">
              {item.meta}
            </KvTypography>
          </KvCardContent>
        </KvCard>
      ))}
    </div>
  );
}
