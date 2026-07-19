'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvTypography } from '@/components/shared/KvTypography';
import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import { cn } from '@/lib/utils';
import type { SyllabusWeek } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';

import { WEEK_WEIGHT_OPTIONS } from '../constants';

/** آخرین سطر همیشه؛ اگر آخرین آرشیو باشد، سطر قبلی هم فعال است. */
export function isWeekRowActionable(
  index: number,
  weeks: SyllabusWeek[]
): boolean {
  if (weeks.length === 0) return false;
  const lastIndex = weeks.length - 1;
  if (index === lastIndex) return true;
  const lastWeek = weeks[lastIndex];
  return lastWeek?.status === 'archived' && index === lastIndex - 1;
}

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
  const isEmpty = !isLoading && weeks.length === 0;

  return (
    <KvCard className={cn(className)}>
      <div className="flex flex-col gap-kv-group border-b border-kv-border p-kv-group sm:flex-row sm:items-center sm:justify-between">
        <KvTypography variant="subtitle" as="h3">
          پیکربندی سرفصل: {courseTitle ?? 'بدون عنوان'}
        </KvTypography>

        <KvButton
          type="button"
          color="success"
          size="sm"
          disabled={!courseOffered}
          onClick={onAddWeek}
          icon={<FaIcon icon={faIcons.plus} size="xs" />}
        >
          افزودن هفته
        </KvButton>
      </div>

      <KvTableViewport
        resetKey={courseTitle ?? 'weeks'}
        isBusy={isLoading}
        hasMore={false}
      >
        <KvTable scrollable={false}>
          <KvTableHeader>
            <KvTableRow>
              <KvTableHead>عنوان جلسه آموزشی</KvTableHead>
              <KvTableHead align="center">ضریب اهمیت</KvTableHead>
              <KvTableHead align="center">عملیات</KvTableHead>
            </KvTableRow>
          </KvTableHeader>
          <KvTableBody>
            {isLoading ? null : isEmpty ? (
              <KvTableEmpty colSpan={3}>
                <KvEmptyState
                  icon={<FaIcon icon={faIcons.rectangleList} size="lg" />}
                  title="سرفصلی تعریف نشده"
                  description="با ارائه درس، هفته‌های پیش‌فرض ساخته می‌شوند."
                />
              </KvTableEmpty>
            ) : (
              weeks.map((week, index) => {
                const archived = week.status === 'archived';
                const actionable =
                  courseOffered && isWeekRowActionable(index, weeks);
                return (
                  <KvTableRow key={week.id}>
                    <KvTableCell emphasis={!archived}>
                      {week.title || week.suffix}
                    </KvTableCell>
                    <KvTableCell align="center">
                      <KvSelectField
                        label={false}
                        size="sm"
                        value={String(week.weight)}
                        disabled={!actionable || archived}
                        onValueChange={(value) =>
                          onWeightChange(week.id, Number.parseInt(value, 10))
                        }
                      >
                        {WEEK_WEIGHT_OPTIONS.map((option) => (
                          <KvSelectItem
                            key={option.value}
                            value={String(option.value)}
                          >
                            {option.label}
                          </KvSelectItem>
                        ))}
                      </KvSelectField>
                    </KvTableCell>
                    <KvTableCell align="center">
                      <div className="flex items-center justify-center gap-1.5">
                        <KvButton
                          type="button"
                          appearance="secondary"
                          size="icon-sm"
                          aria-label="ویرایش عنوان هفته"
                          disabled={!actionable || archived}
                          onClick={() => onEditWeek(week)}
                          icon={
                            <FaIcon icon={faIcons.penToSquare} size="xs" />
                          }
                        />
                        {archived ? (
                          <KvButton
                            type="button"
                            appearance="secondary"
                            size="icon-sm"
                            aria-label="بازیابی هفته"
                            disabled={!actionable}
                            onClick={() => onRestoreWeek(week)}
                            icon={
                              <FaIcon
                                icon={faIcons.clockRotateLeft}
                                size="xs"
                              />
                            }
                          />
                        ) : (
                          <KvButton
                            type="button"
                            color="warning"
                            appearance="ghost"
                            size="icon-sm"
                            aria-label="آرشیو هفته"
                            disabled={!actionable}
                            onClick={() => onArchiveWeek(week)}
                            icon={
                              <FaIcon icon={faIcons.folderOpen} size="xs" />
                            }
                          />
                        )}
                        <KvButton
                          type="button"
                          color="error"
                          appearance="ghost"
                          size="icon-sm"
                          aria-label="حذف هفته"
                          disabled={!actionable}
                          onClick={() => onDeleteWeek(week)}
                          icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
                        />
                      </div>
                    </KvTableCell>
                  </KvTableRow>
                );
              })
            )}
          </KvTableBody>
        </KvTable>
      </KvTableViewport>

      <div className="flex justify-end border-t border-kv-border p-kv-group">
        <KvButton
          type="button"
          color="cta"
          size="md"
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
