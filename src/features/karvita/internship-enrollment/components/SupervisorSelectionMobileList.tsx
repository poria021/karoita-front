'use client';

import { useId, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvMobileListShell } from '@/components/shared/table/KvMobileListShell';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { InternshipSupervisor } from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type SupervisorSelectionMobileListProps = {
  supervisors: InternshipSupervisor[];
  isLoading: boolean;
  submittingId: string | null;
  onEnroll: (supervisorId: string) => void;
};

function capacityLabel(capacity: InternshipSupervisor['capacity']): string {
  return capacity === null ? 'نامحدود' : `${toPersianDigits(capacity)} نفر`;
}

type SupervisorCardProps = {
  supervisor: InternshipSupervisor;
  index: number;
  submittingId: string | null;
  onEnroll: (supervisorId: string) => void;
};

/** کارت تخت و تمام‌عرض مثل کارت گزارش‌ها: بسته = نام و دانشکده؛ با لمس، جزئیات و ثبت‌نام. */
function SupervisorCard({
  supervisor,
  index,
  submittingId,
  onEnroll,
}: SupervisorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();

  return (
    <article className="flex flex-col rounded-none border-y border-kv-border bg-kv-surface p-kv-compact text-start">
      <header
        className="flex cursor-pointer items-center gap-kv-inline"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a,button')) return;
          setExpanded((v) => !v);
        }}
      >
        <span
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-kv-surface-subtle text-[0.6875rem] font-bold tabular-nums text-kv-text-faint"
          aria-hidden
        >
          {toPersianDigits(index + 1)}
        </span>
        <div className="min-w-0 flex-1 text-start">
          <KvTypography variant="subtitle" as="h3" truncate>
            {supervisor.name}
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p" truncate>
            {supervisor.college}
          </KvTypography>
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={expanded ? detailsId : undefined}
          aria-label={expanded ? 'بستن جزئیات' : 'باز کردن جزئیات'}
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-kv-control text-kv-text-faint outline-none transition-colors hover:bg-kv-surface-muted hover:text-kv-text focus-visible:ring-2 focus-visible:ring-kv-brand/40"
        >
          <FaIcon
            icon={faIcons.chevronDown}
            size="2xs"
            className={cn(
              'transition-transform',
              expanded && 'rotate-180 text-kv-brand'
            )}
          />
        </button>
      </header>

      {expanded ? (
        <div
          id={detailsId}
          className="mt-kv-inline flex flex-col gap-kv-inline border-t border-kv-border-muted pt-kv-inline"
        >
          <dl className="grid grid-cols-2 gap-x-kv-group gap-y-kv-inline">
            <div className="flex min-w-0 flex-col gap-kv-micro">
              <dt className="text-[0.6875rem] font-medium text-kv-text-faint">
                استان تابعه
              </dt>
              <dd className="min-w-0 text-[0.8125rem] leading-5 font-bold break-words text-kv-text">
                {supervisor.province}
              </dd>
            </div>
            <div className="flex min-w-0 flex-col gap-kv-micro">
              <dt className="text-[0.6875rem] font-medium text-kv-text-faint">
                ظرفیت
              </dt>
              <dd className="min-w-0 text-[0.8125rem] leading-5 font-bold text-kv-brand">
                {capacityLabel(supervisor.capacity)}
              </dd>
            </div>
            {supervisor.days.length > 0 ? (
              <div className="col-span-2 flex min-w-0 flex-col gap-kv-micro">
                <dt className="text-[0.6875rem] font-medium text-kv-text-faint">
                  روزها
                </dt>
                <dd className="flex flex-wrap items-center gap-kv-pair">
                  {supervisor.days.map((day) => (
                    <Badge key={day} variant="brand">
                      {day}
                    </Badge>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>

          <KvButton
            type="button"
            color="cta"
            appearance="solid"
            className="w-full max-sm:min-h-11"
            loading={submittingId === supervisor.id}
            disabled={submittingId !== null}
            onClick={() => onEnroll(supervisor.id)}
            icon={<FaIcon icon={faIcons.check} size="xs" />}
            iconPosition="start"
          >
            ثبت‌نام و اخذ واحد با این استاد
          </KvButton>
        </div>
      ) : null}
    </article>
  );
}

export function SupervisorSelectionMobileList({
  supervisors,
  isLoading,
  submittingId,
  onEnroll,
}: SupervisorSelectionMobileListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-kv-pair lg:hidden">
      <KvMobileListShell
        isLoading={isLoading}
        isEmpty={supervisors.length === 0}
        hasItems={supervisors.length > 0}
        emptyTitle="استاد راهنمای در دسترس یافت نشد"
        emptyDescription="هیچ استادی دارای ظرفیت مجاز در حوزه انتخابی شما یافت نشد."
      >
        {supervisors.map((supervisor, index) => (
          <SupervisorCard
            key={supervisor.id}
            supervisor={supervisor}
            index={index}
            submittingId={submittingId}
            onEnroll={onEnroll}
          />
        ))}
      </KvMobileListShell>
    </div>
  );
}
