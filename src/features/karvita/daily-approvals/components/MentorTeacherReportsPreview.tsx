'use client';

import { KvButton } from '@/components/shared/KvButton';
import {
  KvCard,
  KvCardContent,
  KvCardHeader,
  KvCardTitle,
} from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { useMentorTeacherReports } from '@/features/karvita/daily-approvals/hooks/useMentorTeacherReports';
import type { MentorTeacherReportStatus } from '@/types/mentor-teacher-reports';

const statusMeta: Record<
  MentorTeacherReportStatus,
  { label: string; className: string }
> = {
  approved: {
    label: 'تأیید شده',
    className: 'border border-kv-brand-border bg-kv-brand-soft text-kv-brand-soft-fg',
  },
  pending: {
    label: 'در انتظار',
    className: 'border border-kv-border bg-kv-surface-subtle text-kv-text-secondary',
  },
  revision: {
    label: 'نیازمند اصلاح',
    className: 'border border-kv-warning/30 bg-kv-warning-soft text-kv-warning',
  },
};

const summaryToneClasses: Record<
  'brand' | 'success' | 'warning' | 'info',
  string
> = {
  brand: 'bg-kv-brand-soft text-kv-brand-soft-fg',
  success: 'bg-kv-success-soft text-kv-success',
  warning: 'bg-kv-warning-soft text-kv-warning',
  info: 'bg-kv-surface-subtle text-kv-text-secondary',
};

export function MentorTeacherReportsPreview() {
  const { summary, students, feedback, isLoading, isError } =
    useMentorTeacherReports();

  if (isLoading) {
    return (
      <div className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-section">
        <KvTypography variant="subtitle" as="p">
          در حال بارگذاری گزارش‌ها...
        </KvTypography>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-kv-panel border border-kv-danger-border bg-kv-danger-soft p-kv-section">
        <KvTypography variant="subtitle" as="p" tone="danger">
          خطا در بارگذاری گزارش‌ها
        </KvTypography>
      </div>
    );
  }

  return (
    <div className="space-y-kv-group">
      <div className="flex flex-col gap-kv-group border-b border-kv-border pb-kv-group sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-kv-pair">
          <KvTypography variant="title" as="h2">
            گزارش‌های معلم راهنما
          </KvTypography>
          <KvTypography variant="body" tone="muted" as="p">
            وضعیت گزارش‌های هفتگی، بازخوردها و امتیازهای کارورزان در یک نگاه.
          </KvTypography>
        </div>
        <div className="flex flex-wrap gap-kv-pair">
          <KvButton type="button" size="sm" appearance="secondary">
            همه
          </KvButton>
          <KvButton type="button" size="sm" appearance="ghost">
            در انتظار
          </KvButton>
          <KvButton type="button" size="sm" appearance="ghost">
            نیازمند اصلاح
          </KvButton>
        </div>
      </div>

      <div className="grid gap-kv-group sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
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

      <div className="grid gap-kv-group xl:grid-cols-[1.7fr_1fr]">
        <KvCard className="overflow-hidden">
          <KvCardHeader bordered className="px-kv-group py-kv-group">
            <KvCardTitle>گزارش‌های هفتگی</KvCardTitle>
          </KvCardHeader>
          <KvCardContent className="p-0">
            <div className="divide-y divide-kv-border">
              {students.map((student) => {
                const status = statusMeta[student.status];
                return (
                  <div
                    key={student.id}
                    className="flex flex-col gap-kv-group px-kv-group py-kv-group md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0 space-y-kv-pair">
                      <div className="flex items-center gap-kv-pair">
                        <span className="flex size-10 items-center justify-center rounded-kv-control bg-kv-brand-soft text-sm font-black text-kv-brand-soft-fg">
                          {student.name.slice(0, 1)}
                        </span>
                        <div className="min-w-0">
                          <KvTypography variant="subtitle" as="p" truncate>
                            {student.name}
                          </KvTypography>
                          <KvTypography variant="caption" tone="muted" as="p">
                            {student.school} · {student.course}
                          </KvTypography>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-kv-pair text-start md:items-end">
                      <div className="flex items-center gap-kv-pair">
                        <span className={`rounded-kv-control px-2 py-1 text-[11px] font-bold ${status.className}`}>
                          {status.label}
                        </span>
                        <span className="rounded-kv-control bg-kv-surface-subtle px-2 py-1 text-[11px] font-bold text-kv-text-secondary">
                          {student.week}
                        </span>
                      </div>
                      <div className="flex items-center gap-kv-group">
                        <KvTypography variant="caption" tone="muted" as="span">
                          {student.updatedAt}
                        </KvTypography>
                        <KvTypography variant="subtitle" as="span">
                          {student.score}/۱۰۰
                        </KvTypography>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </KvCardContent>
        </KvCard>

        <KvCard>
          <KvCardHeader bordered className="px-kv-group py-kv-group">
            <KvCardTitle>بازخوردهای اخیر</KvCardTitle>
          </KvCardHeader>
          <KvCardContent className="space-y-kv-group p-kv-group">
            {feedback.map((item) => (
              <div
                key={item.id}
                className="rounded-kv-control border border-kv-border bg-kv-surface-subtle p-kv-group"
              >
                <div className="mb-kv-pair flex items-start justify-between gap-kv-pair">
                  <KvTypography variant="subtitle" as="h3">
                    {item.title}
                  </KvTypography>
                  <KvTypography variant="caption" tone="muted" as="span">
                    {item.time}
                  </KvTypography>
                </div>
                <KvTypography variant="body" tone="muted" as="p">
                  {item.body}
                </KvTypography>
                <KvTypography variant="caption" tone="brand" as="p" className="mt-kv-pair">
                  {item.author}
                </KvTypography>
              </div>
            ))}
          </KvCardContent>
        </KvCard>
      </div>
    </div>
  );
}
