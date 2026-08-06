'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { getAdminTableBodyPhase } from '@/components/shared/table/adminTableBodyPhase';
import { KvTableBusy } from '@/components/shared/table/KvTableBusy';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';
import {
  KvTable,
  KvTableBody,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { KvTableRowIndexHead } from '@/components/shared/table/KvTableRowIndex';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import { cn } from '@/lib/utils';
import type { SyllabusWeek } from '@/types/syllabus-config';
import { getModuleEmptyCopy } from '@/utils/moduleDiscoverability';
import { faIcons } from '@/utils/iconMap';

import { WeeklySyllabusWeekRow } from './WeeklySyllabusWeekRow';

interface WeeklySyllabusTableProps {
  courseTitle: string | null;
  weeks: SyllabusWeek[];
  isLoading: boolean;
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
  const emptyCopy = getModuleEmptyCopy('syllabus_weeks');
  const canEdit = Boolean(courseTitle);

  return (
    <KvCard
      className={cn(
        'flex flex-col gap-kv-group',
        'rounded-none border-0 bg-transparent p-0 shadow-none',
        'md:rounded-kv-control md:border md:border-kv-border md:bg-kv-surface md:p-kv-group md:shadow-kv-raised',
        className
      )}
    >
      <div className="flex flex-col gap-kv-group sm:flex-row sm:items-center sm:justify-between">
        <KvTypography variant="subtitle" as="h3">
          پیکربندی سرفصل: {courseTitle ?? 'بدون عنوان'}
        </KvTypography>

        <KvButton
          type="button"
          color="success"
          size="sm"
          className="w-full sm:w-auto"
          disabled={!canEdit}
          onClick={onAddWeek}
          icon={<FaIcon icon={faIcons.plus} size="xs" />}
        >
          افزودن هفته
        </KvButton>
      </div>

      <div className="border-t border-kv-border-muted pt-kv-group">
        <KvTableViewport
          resetKey={courseTitle ?? 'weeks'}
          isBusy={isLoading}
          hasMore={false}
          heightClassName="max-h-[400px] min-h-[200px]"
        >
          <KvTable scrollable={false} className="w-full table-fixed">
            <KvTableHeader>
              <KvTableRow>
                <KvTableRowIndexHead />
                <KvTableHead>عنوان جلسه آموزشی</KvTableHead>
                <KvTableHead
                  align="center"
                  className="w-[9.5rem] sm:w-40 lg:w-44"
                >
                  ضریب اهمیت
                </KvTableHead>
                <KvTableHead align="center" className="w-28 sm:w-32">
                  عملیات
                </KvTableHead>
              </KvTableRow>
            </KvTableHeader>
            <KvTableBody>
              {bodyPhase === 'busy' ? (
                <KvTableBusy colSpan={4} />
              ) : bodyPhase === 'empty' ? (
                <KvTableEmpty colSpan={4}>
                  <KvEmptyState
                    title={emptyCopy.title}
                    description={
                      canEdit
                        ? 'هنوز هفته‌ای برای این درس ثبت نشده است.'
                        : emptyCopy.description
                    }
                    actions={
                      canEdit ? (
                        <KvButton
                          type="button"
                          color="cta"
                          appearance="solid"
                          size="sm"
                          onClick={onAddWeek}
                          icon={<FaIcon icon={faIcons.plus} size="xs" />}
                        >
                          افزودن هفته
                        </KvButton>
                      ) : undefined
                    }
                  />
                </KvTableEmpty>
              ) : (
                weeks.map((week, index) => (
                  <WeeklySyllabusWeekRow
                    key={week.id}
                    week={week}
                    index={index}
                    weeks={weeks}
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
      </div>

      <div className="flex flex-col border-t border-kv-border-muted pt-kv-group sm:flex-row sm:justify-end">
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
