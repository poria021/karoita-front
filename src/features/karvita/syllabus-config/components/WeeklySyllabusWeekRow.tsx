'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import {
  KvTableCell,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { cn } from '@/lib/utils';
import type { SyllabusWeek } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';

import { WEEK_WEIGHT_OPTIONS } from '../constants';
import { isWeekRowActionable } from './weeklySyllabusRowUtils';

type WeeklySyllabusWeekRowProps = {
  week: SyllabusWeek;
  index: number;
  weeks: SyllabusWeek[];
  courseOffered: boolean;
  onWeightChange: (weekId: string, weight: number) => void;
  onEditWeek: (week: SyllabusWeek) => void;
  onArchiveWeek: (week: SyllabusWeek) => void;
  onRestoreWeek: (week: SyllabusWeek) => void;
  onDeleteWeek: (week: SyllabusWeek) => void;
};

export function WeeklySyllabusWeekRow({
  week,
  index,
  weeks,
  courseOffered,
  onWeightChange,
  onEditWeek,
  onArchiveWeek,
  onRestoreWeek,
  onDeleteWeek,
}: WeeklySyllabusWeekRowProps) {
  const archived = week.status === 'archived';
  const structureActionable =
    courseOffered && isWeekRowActionable(index, weeks);
  const contentEditable = courseOffered && !archived;
  const muted = !courseOffered || archived;

  return (
    <KvTableRow
      className={cn(
        !courseOffered && 'hover:bg-transparent hover:text-kv-text-faint'
      )}
    >
      <KvTableCell
        emphasis={!muted}
        className={cn('max-w-0 truncate', muted && 'text-kv-text-faint')}
      >
        {week.title || week.suffix}
      </KvTableCell>
      <KvTableCell align="center" className="w-24 sm:w-36">
        <div className="mx-auto w-full max-w-[5.75rem] sm:max-w-32">
          <KvSelectField
            label={false}
            size="sm"
            value={String(week.weight)}
            disabled={!contentEditable}
            onValueChange={(value) =>
              onWeightChange(week.id, Number.parseInt(value, 10))
            }
          >
            {WEEK_WEIGHT_OPTIONS.map((option) => (
              <KvSelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </KvSelectItem>
            ))}
          </KvSelectField>
        </div>
      </KvTableCell>
      <KvTableCell align="center" className="w-28 whitespace-nowrap sm:w-32">
        <div className="flex items-center justify-center gap-1">
          <KvButton
            type="button"
            appearance="secondary"
            size="icon-sm"
            aria-label="ویرایش عنوان هفته"
            disabled={!contentEditable}
            onClick={() => onEditWeek(week)}
            icon={<FaIcon icon={faIcons.penToSquare} size="xs" />}
          />
          {archived ? (
            <KvButton
              type="button"
              appearance="secondary"
              size="icon-sm"
              aria-label="بازیابی هفته"
              disabled={!structureActionable}
              onClick={() => onRestoreWeek(week)}
              icon={<FaIcon icon={faIcons.clockRotateLeft} size="xs" />}
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
              icon={<FaIcon icon={faIcons.folderOpen} size="xs" />}
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
            icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
          />
        </div>
      </KvTableCell>
    </KvTableRow>
  );
}
