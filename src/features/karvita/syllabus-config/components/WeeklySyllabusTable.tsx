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
import { getAdminTableBodyPhase } from '@/components/shared/table/adminTableBodyPhase';
import { KvTableBusy } from '@/components/shared/table/KvTableBusy';
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
  const bodyPhase = getAdminTableBodyPhase(isLoading, weeks.length);

  return (
    <KvCard
      className={cn(
        'flex flex-col gap-kv-group',
        /* موبایل: بدون باکس؛ دسکتاپ: کارت کامل */
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
                  weeks.map((week, index) => {
                    const archived = week.status === 'archived';
                    const structureActionable =
                      courseOffered && isWeekRowActionable(index, weeks);
                    /** ویرایش عنوان/ضریب برای همهٔ هفته‌های فعالِ درس ارائه‌شده */
                    const contentEditable = courseOffered && !archived;
                    const muted = !courseOffered || archived;
                    return (
                      <KvTableRow
                        key={week.id}
                        className={cn(
                          !courseOffered &&
                            'hover:bg-transparent hover:text-kv-text-faint'
                        )}
                      >
                        <KvTableCell
                          emphasis={!muted}
                          className={cn(
                            'max-w-0 truncate',
                            muted && 'text-kv-text-faint'
                          )}
                        >
                          {week.title || week.suffix}
                        </KvTableCell>
                        <KvTableCell
                          align="center"
                          className="w-24 sm:w-36"
                        >
                          <div className="mx-auto w-full max-w-[5.75rem] sm:max-w-32">
                            <KvSelectField
                              label={false}
                              size="sm"
                              value={String(week.weight)}
                              disabled={!contentEditable}
                              onValueChange={(value) =>
                                onWeightChange(
                                  week.id,
                                  Number.parseInt(value, 10)
                                )
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
                          </div>
                        </KvTableCell>
                        <KvTableCell
                          align="center"
                          className="w-28 whitespace-nowrap sm:w-32"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <KvButton
                              type="button"
                              appearance="secondary"
                              size="icon-sm"
                              aria-label="ویرایش عنوان هفته"
                              disabled={!contentEditable}
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
                                disabled={!structureActionable}
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
                                disabled={!structureActionable}
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
                              disabled={!structureActionable}
                              onClick={() => onDeleteWeek(week)}
                              icon={
                                <FaIcon icon={faIcons.trashCan} size="xs" />
                              }
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
