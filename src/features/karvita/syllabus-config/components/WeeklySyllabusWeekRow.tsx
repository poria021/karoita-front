'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import {
  KvTableCell,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { KvTableRowIndexCell } from '@/components/shared/table/KvTableRowIndex';
import type { SyllabusWeek } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { WEEK_WEIGHT_OPTIONS } from '../constants';

type WeeklySyllabusWeekRowProps = {
  week: SyllabusWeek;
  index: number;
  onWeightChange: (weekId: string, weight: number) => void;
  onEditWeek: (week: SyllabusWeek) => void;
};

export function WeeklySyllabusWeekRow({
  week,
  index,
  onWeightChange,
  onEditWeek,
}: WeeklySyllabusWeekRowProps) {
  return (
    <KvTableRow>
      <KvTableRowIndexCell index={index} />
      <KvTableCell emphasis className="max-w-0 truncate">
        {toPersianDigits(week.title || week.suffix)}
      </KvTableCell>
      <KvTableCell
        align="center"
        className="w-[9.5rem] sm:w-40 lg:w-44"
      >
        <div className="mx-auto flex w-full min-w-0 items-center justify-center">
          <KvSelectField
            label={false}
            size="sm"
            value={String(week.weight)}
            displayValue={
              WEEK_WEIGHT_OPTIONS.find((option) => option.value === week.weight)
                ?.label
            }
            onValueChange={(value) =>
              onWeightChange(week.id, Number.parseInt(value, 10))
            }
            triggerClassName="h-8 min-h-8 px-2.5 data-[size=default]:h-8 data-[size=sm]:h-8"
          >
            {WEEK_WEIGHT_OPTIONS.map((option) => (
              <KvSelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </KvSelectItem>
            ))}
          </KvSelectField>
        </div>
      </KvTableCell>
      <KvTableCell align="center" className="w-16 sm:w-20">
        <div className="flex h-8 items-center justify-center">
          <KvButton
            type="button"
            color="neutral"
            appearance="ghost"
            size="icon-xs"
            aria-label="ویرایش عنوان هفته"
            onClick={() => onEditWeek(week)}
            icon={<FaIcon icon={faIcons.penToSquare} size="xs" />}
          />
        </div>
      </KvTableCell>
    </KvTableRow>
  );
}
