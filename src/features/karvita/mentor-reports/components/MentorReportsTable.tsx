'use client';

import { KvCard, KvCardContent, KvCardHeader, KvCardTitle } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import type {
  MentorTeacherReportStatus,
  MentorTeacherStudentReport,
} from '@/types/mentor-teacher-reports';

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

export function MentorReportsTable({
  students,
}: {
  students: MentorTeacherStudentReport[];
}) {
  return (
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
  );
}
