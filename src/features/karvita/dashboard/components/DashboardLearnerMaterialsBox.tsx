'use client';

import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvCard,
  KvCardContent,
  KvCardIdentity,
} from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { Badge } from '@/components/ui/badge';
import { useLearnerMaterialsBadge } from '@/features/karvita/course-materials/hooks/useLearnerMaterialsBadge';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import type { LearnerActiveCourse } from '../lib/learner-workbench';

type DashboardLearnerMaterialsBoxProps = {
  course: LearnerActiveCourse | null;
  isLoading?: boolean;
  className?: string;
};

/** باکس جزوه‌های جدید دورهٔ کانون میز کار. */
export function DashboardLearnerMaterialsBox({
  course,
  isLoading = false,
  className,
}: DashboardLearnerMaterialsBoxProps) {
  const badge = useLearnerMaterialsBadge(
    course?.kind ?? 'internship',
    course?.courseKey ?? ''
  );

  if (isLoading) {
    return (
      <div
        aria-hidden
        className={cn(
          'min-h-[14rem] animate-pulse rounded-kv-shell border border-kv-border/70 bg-kv-surface shadow-kv-soft',
          className
        )}
      />
    );
  }

  if (!course) return null;

  return (
    <KvCard
      tone="surface"
      padding="none"
      className={cn(
        'h-full overflow-hidden border-kv-border/70 shadow-kv-soft',
        className
      )}
      aria-label="جزوه‌های درسی"
    >
      <KvCardContent padding="md" stacked className="gap-kv-group">
        <header className="flex flex-wrap items-start justify-between gap-kv-group">
          <KvCardIdentity
            leading={
              <span className="flex size-11 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand-soft-fg shadow-kv-soft">
                <FaIcon icon={faIcons.bookOpen} size="sm" />
              </span>
            }
          >
            <div className="min-w-0 space-y-1 text-start">
              <KvTypography variant="caption" tone="muted" as="p" className="font-bold">
                صندوق جزوات
              </KvTypography>
              <KvTypography variant="subtitle" weight="bold" as="h3">
                جزوه‌ها و فایل‌های درسی
              </KvTypography>
              <KvTypography variant="caption" tone="muted" as="p">
                {course.courseTitle}
              </KvTypography>
            </div>
          </KvCardIdentity>
          {badge.hasNew ? (
            <Badge variant="warning">
              {toPersianDigits(badge.newCount)} جدید
            </Badge>
          ) : null}
        </header>

        <KvTypography variant="body" tone="muted" as="p" className="text-sm">
          {badge.isLoading
            ? 'در حال بررسی جزوه‌های جدید…'
            : badge.hasNew
              ? `${toPersianDigits(badge.newCount)} جزوهٔ جدید از زمان آخرین بازدید شما اضافه شده است.`
              : 'فعلاً جزوهٔ جدیدی ندارید. برای مشاهدهٔ همهٔ فایل‌ها وارد صفحهٔ درس شوید.'}
        </KvTypography>

        <div className="mt-auto flex justify-end">
          <KvButton asChild appearance="secondary" size="sm">
            <Link href={course.href} prefetch>
              باز کردن صندوق جزوات
            </Link>
          </KvButton>
        </div>
      </KvCardContent>
    </KvCard>
  );
}
