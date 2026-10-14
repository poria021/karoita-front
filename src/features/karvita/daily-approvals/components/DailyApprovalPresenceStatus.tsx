'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { Badge } from '@/components/ui/badge';
import type { DailyApprovalWeek } from '@/types/daily-approvals';
import { faIcons } from '@/utils/iconMap';
import { formatJalaliSlashDisplay } from '@/utils/formatJalaliDate';

type PresenceRow = {
  key: string;
  icon: (typeof faIcons)[keyof typeof faIcons];
  label: string;
  state: 'approved' | 'pending' | 'none';
  stateLabel: string;
  at?: string | null;
};

function formatPresenceDay(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : formatJalaliSlashDisplay(date);
}

const STATE_VARIANT = {
  approved: 'success',
  pending: 'warning',
  none: 'default',
} as const;

/**
 * وضعیت حضور این هفته: اعلام حضور استاد راهنما (`mentor-present`) و
 * تأییدهای مدیر مدرسه (`approve-mentor-present`/`approve-student-present`).
 * وقتی هیچ داده‌ای نیست چیزی رندر نمی‌شود تا مودال شلوغ نشود.
 */
export function DailyApprovalPresenceStatus({ week }: { week: DailyApprovalWeek }) {
  const mentorDeclared = week.mentorPresent === true || week.schoolVisited === true;
  const mentorApproved = week.mentorPresenceApproved === true;
  const studentApproved = week.studentPresenceApproved === true;
  if (!mentorDeclared && !mentorApproved && !studentApproved) return null;

  const rows: PresenceRow[] = [
    {
      key: 'mentor',
      icon: faIcons.userTie,
      label: 'حضور استاد راهنما در مدرسه',
      state: mentorApproved ? 'approved' : mentorDeclared ? 'pending' : 'none',
      stateLabel: mentorApproved
        ? 'تأیید مدیر مدرسه'
        : mentorDeclared
          ? 'اعلام‌شده، در انتظار تأیید مدیر'
          : 'ثبت نشده',
      at: mentorApproved ? week.mentorPresentAt : null,
    },
    {
      key: 'student',
      icon: faIcons.graduationCap,
      label: 'حضور کارورز در مدرسه',
      state: studentApproved ? 'approved' : 'none',
      stateLabel: studentApproved ? 'تأیید مدیر مدرسه' : 'هنوز تأیید نشده',
      at: studentApproved ? week.studentPresentAt : null,
    },
  ];

  return (
    <section
      aria-label="وضعیت حضور در مدرسه"
      className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-stack"
    >
      <KvTypography variant="label" as="h4" className="mb-kv-pair">
        وضعیت حضور در مدرسه
      </KvTypography>
      <ul className="flex flex-col divide-y divide-kv-border">
        {rows.map((row) => {
          const dayLabel = formatPresenceDay(row.at);
          return (
            <li
              key={row.key}
              className="flex flex-wrap items-center justify-between gap-kv-pair py-kv-pair"
            >
              <span className="flex min-w-0 items-center gap-kv-pair">
                <FaIcon icon={row.icon} size="sm" className="text-kv-text-secondary" />
                <KvTypography variant="body" as="span">
                  {row.label}
                </KvTypography>
              </span>
              <span className="flex items-center gap-kv-pair">
                {dayLabel ? (
                  <KvTypography variant="caption" tone="muted" as="span">
                    {dayLabel}
                  </KvTypography>
                ) : null}
                <Badge variant={STATE_VARIANT[row.state]}>
                  {row.state === 'approved' ? (
                    <FaIcon icon={faIcons.circleCheck} size="xs" />
                  ) : row.state === 'pending' ? (
                    <FaIcon icon={faIcons.hourglassHalf} size="xs" />
                  ) : null}
                  {row.stateLabel}
                </Badge>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
