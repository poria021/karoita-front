'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvTypography } from '@/components/shared/KvTypography';
import type { AcademicTerm, AcademicTermType } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import {
  MODULAR_PREFIX_OPTIONS,
  SEMESTER_PREFIX_OPTIONS,
  TERM_TYPE_OPTIONS,
  displayAcademicYear,
} from '../constants';

interface TermFormCardProps {
  terms: AcademicTerm[];
  editTermId: string;
  onSelectEditTerm: (termId: string) => void;
  termType: AcademicTermType;
  onTermTypeChange: (type: AcademicTermType) => void;
  termPrefix: string;
  onTermPrefixChange: (prefix: string) => void;
  termYear: string;
  onTermYearChange: (year: string) => void;
  academicYears: string[];
  isSaving: boolean;
  onSave: () => void;
  onRequestDelete: () => void;
}

export function TermFormCard({
  terms,
  editTermId,
  onSelectEditTerm,
  termType,
  onTermTypeChange,
  termPrefix,
  onTermPrefixChange,
  termYear,
  onTermYearChange,
  academicYears,
  isSaving,
  onSave,
  onRequestDelete,
}: TermFormCardProps) {
  const isEditing = Boolean(editTermId);
  const prefixOptions =
    termType === 'modular' ? MODULAR_PREFIX_OPTIONS : SEMESTER_PREFIX_OPTIONS;

  return (
    <KvCard>
      <KvCardContent padding="md" className="space-y-kv-group">
        <div className="flex items-center gap-2.5 border-b border-kv-border pb-kv-pair">
          <div className="flex size-9 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand">
            <FaIcon icon={faIcons.plus} size="sm" />
          </div>
          <div>
            <KvTypography variant="subtitle" as="h4">
              تعریف و ساختارسازی ترم جدید
            </KvTypography>
            <KvTypography variant="caption" tone="muted">
              مدیریت دوره‌های تحصیلی و چرخه‌های فعال سیستم
            </KvTypography>
          </div>
        </div>

        <KvSelectField
          label="عملیات در حال انجام"
          required
          size="md"
          value={editTermId || '__new__'}
          onValueChange={(value) =>
            onSelectEditTerm(value === '__new__' ? '' : value)
          }
        >
          <KvSelectItem value="__new__">
            -- ایجاد و تعریف دوره تحصیلی جدید --
          </KvSelectItem>
          {terms.map((term) => (
            <KvSelectItem key={term.id} value={term.id}>
              ویرایش دوره: {toPersianDigits(term.title)}
            </KvSelectItem>
          ))}
        </KvSelectField>

        <KvSelectField
          label="نوع ساختار دوره"
          required
          size="md"
          value={termType}
          disabled={isEditing}
          onValueChange={(value) =>
            onTermTypeChange(value as AcademicTermType)
          }
        >
          {TERM_TYPE_OPTIONS.map((option) => (
            <KvSelectItem key={option.value} value={option.value}>
              {option.label}
            </KvSelectItem>
          ))}
        </KvSelectField>

        <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
          <KvSelectField
            label={
              termType === 'modular'
                ? 'انتخاب پودمان مهارتی'
                : 'عنوان بازه نیم‌سال'
            }
            required
            size="md"
            value={termPrefix}
            disabled={isEditing}
            onValueChange={onTermPrefixChange}
          >
            {prefixOptions.map((prefix) => (
              <KvSelectItem key={prefix} value={prefix}>
                {prefix}
              </KvSelectItem>
            ))}
          </KvSelectField>

          <KvSelectField
            label="سال تحصیلی خورشیدی"
            required
            size="md"
            value={termYear}
            disabled={isEditing}
            onValueChange={onTermYearChange}
          >
            {academicYears.map((year) => (
              <KvSelectItem key={year} value={year}>
                {displayAcademicYear(year)}
              </KvSelectItem>
            ))}
          </KvSelectField>
        </div>

        <div className="flex flex-col gap-2 border-t border-kv-border-muted pt-kv-group sm:flex-row sm:flex-wrap sm:justify-end">
          {isEditing ? (
            <KvButton
              type="button"
              color="error"
              size="md"
              className="w-full sm:w-auto"
              onClick={onRequestDelete}
              icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
            >
              حذف این دوره
            </KvButton>
          ) : (
            <KvButton
              type="button"
              color="cta"
              size="md"
              className="w-full sm:w-auto"
              loading={isSaving}
              onClick={onSave}
            >
              ایجاد دوره تحصیلی
            </KvButton>
          )}
        </div>
      </KvCardContent>
    </KvCard>
  );
}
