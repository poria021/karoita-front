'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import {
  KvTable,
  KvTableBody,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { getAdminTableBodyPhase } from '@/components/shared/table/adminTableBodyPhase';
import { KvTableBusy } from '@/components/shared/table/KvTableBusy';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import { cn } from '@/lib/utils';
import type { SyllabusWeek } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';

import { WeeklySyllabusWeekRow } from './WeeklySyllabusWeekRow';

interface WeeklySyllabusTableProps {
  courseTitle: string | null;
  weeks: SyllabusWeek[];
  isLoading: boolean;
  courseOffered: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  className?: string;
  onWeightChange: (weekId: string, weight: number) => void;
  onEditWeek: (week: SyllabusWeek) => void;
  onArchiveWeek: (week: SyllabusWeek) => void;
  onRestoreWeek: (week: SyllabusWeek) => void;
  onAddWeek: () => void;
  onDeleteWeek: (week: SyllabusWeek) => void;
  onSave: () => void;
}

export function WeeklySyllabusTable({
  courseTitle,
  weeks,
  isLoading,
  courseOffered,
  hasUnsavedChanges,
  isSaving,
  className,
  onWeightChange,
  onEditWeek,
  onArchiveWeek,
  onRestoreWeek,
  onAddWeek,
  onDeleteWeek,
  onSave,
}: WeeklySyllabusTableProps) {
  const bodyPhase = getAdminTableBodyPhase(isLoading, weeks.length);

  return (
    <KvCard
      className={cn(
        'flex flex-col gap-kv-group',
        'rounded-none border-0 bg-transparent p-0 shadow-none',
        'md:rounded-kv-panel md:border md:border-kv-border md:bg-kv-surface md:p-kv-group md:shadow-kv-raised',
        className
      )}
    >
      <div className="flex flex-col gap-kv-group sm:flex-row sm:items-center sm:justify-between">
        <KvTypography
          variant="subtitle"
          as="h3"
          tone={!courseOffered ? 'disabled' : undefined}
        >
          پیکربندی سرفصل: {courseTitle ?? 'بدون عنوان'}
        </KvTypography>

        <KvButton
          type="button"
          color="success"
          size="sm"
          className="w-full sm:w-auto"
          disabled={!courseOffered}
          onClick={onAddWeek}
          icon={<FaIcon icon={faIcons.plus} size="xs" />}
        >
          افزودن هفته
        </KvButton>
      </div>

      <KvCard
        className={cn(
          'w-full',
          !courseOffered && 'border-kv-border bg-kv-surface-muted/40'
        )}
        aria-disabled={!courseOffered}
      >
        <KvTableViewport
          resetKey={courseTitle ?? 'weeks'}
          isBusy={isLoading}
          hasMore={false}
          heightClassName="max-h-[400px] min-h-[200px]"
          className={cn(!courseOffered && 'pointer-events-none opacity-55')}
        >
          <KvTable
            scrollable={false}
            className={cn(
              'w-full table-fixed',
              !courseOffered &&
                'text-kv-text-faint [&_[data-slot=kv-table-cell]]:text-kv-text-faint [&_[data-slot=kv-table-head]]:text-kv-text-faint [&_tr]:font-normal [&_tr]:hover:bg-transparent [&_tr]:hover:text-kv-text-faint'
            )}
          >
            <KvTableHeader>
              <KvTableRow
                className={cn(!courseOffered && 'hover:bg-transparent')}
              >
                <KvTableHead>عنوان جلسه آموزشی</KvTableHead>
                <KvTableHead align="center" className="w-24 sm:w-36">
                  ضریب اهمیت
                </KvTableHead>
                <KvTableHead align="center" className="w-28 sm:w-32">
                  عملیات
                </KvTableHead>
              </KvTableRow>
            </KvTableHeader>
            <KvTableBody>
              {bodyPhase === 'busy' ? (
                <KvTableBusy colSpan={3} />
              ) : bodyPhase === 'empty' ? (
                <KvTableEmpty colSpan={3}>
                  <KvEmptyState
                    icon={<FaIcon icon={faIcons.rectangleList} size="lg" />}
                    title="سرفصلی تعریف نشده"
                    description="با ارائه درس، هفته‌های پیش‌فرض ساخته می‌شوند."
                  />
                </KvTableEmpty>
              ) : (
                weeks.map((week, index) => (
                  <WeeklySyllabusWeekRow
                    key={week.id}
                    week={week}
                    index={index}
                    weeks={weeks}
                    courseOffered={courseOffered}
                    onWeightChange={onWeightChange}
                    onEditWeek={onEditWeek}
                    onArchiveWeek={onArchiveWeek}
                    onRestoreWeek={onRestoreWeek}
                    onDeleteWeek={onDeleteWeek}
                  />
                ))
              )}
            </KvTableBody>
          </KvTable>
        </KvTableViewport>
      </KvCard>

      <div className="flex flex-col sm:flex-row sm:justify-end">
        <KvButton
          type="button"
          color="cta"
          size="md"
          className="w-full sm:w-auto"
          loading={isSaving}
          disabled={!hasUnsavedChanges || isSaving}
          onClick={onSave}
        >
          ثبت نهایی و انتشار برنامه به کاربران
        </KvButton>
      </div>
    </KvCard>
  );
}
