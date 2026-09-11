'use client';

import { useMemo } from 'react';

import { AppTabs, AppTabsList, AppTabsTrigger } from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvCardTitleIcon } from '@/components/shared/KvCardTitleIcon';
import { KvFieldFrame } from '@/components/shared/fields/KvFieldFrame';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import type { AcademicTerm, AcademicTermType } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';
import {
  persianToEnglishDigits,
  toPersianDigits,
} from '@/utils/persianDigits';

import {
  MODULAR_PREFIX_OPTIONS,
  SEMESTER_PREFIX_OPTIONS,
  TERM_TYPE_OPTIONS,
  displayAcademicYear,
  formatTermOptionLabel,
} from '../constants';

const TERM_TYPE_ICONS: Record<AcademicTermType, typeof faIcons.graduationCap> = {
  semester: faIcons.graduationCap,
  modular: faIcons.screwdriverWrench,
};

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
  isSaving: boolean;
  formError?: string | null;
  academicYearError?: string | null;
  isDirty?: boolean;
  onSave: () => void;
  onRequestDelete: () => void;
  isLoading?: boolean;
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
  isSaving,
  formError,
  academicYearError,
  isDirty = false,
  onSave,
  onRequestDelete,
  isLoading = false,
}: TermFormCardProps) {
  const isEditing = Boolean(editTermId);
  const prefixOptions =
    termType === 'modular' ? MODULAR_PREFIX_OPTIONS : SEMESTER_PREFIX_OPTIONS;
  const canSubmit = isEditing ? isDirty : isDirty || !termYear.trim();
  const activeTermTypeOption =
    TERM_TYPE_OPTIONS.find((option) => option.value === termType) ??
    TERM_TYPE_OPTIONS[0]!;
  const termsForActiveType = useMemo(
    () => terms.filter((term) => term.type === termType),
    [terms, termType]
  );

  return (
    <KvCard>
      <KvCardContent padding="md" className="space-y-kv-group">
        <div className="flex items-center gap-kv-pair border-b border-kv-border pb-kv-pair">
          <KvCardTitleIcon icon={faIcons.plus} />
          <KvTypography variant="subtitle" weight="black" as="h4" className="min-w-0">
            {isEditing ? 'ویرایش دوره تحصیلی' : 'تعریف و ساختارسازی ترم جدید'}
          </KvTypography>
        </div>

        <KvFieldFrame
          id="syllabus-term-type"
          fieldId="syllabus-term-type-tabs"
          label="نوع ساختار دوره"
          required
          hint={activeTermTypeOption.description}
        >
          <AppTabs
            id="syllabus-term-type-tabs"
            value={termType}
            onValueChange={(value) =>
              onTermTypeChange(value as AcademicTermType)
            }
            gridCols={2}
          >
            <AppTabsList aria-label="نوع ساختار دوره">
              {TERM_TYPE_OPTIONS.map((option) => (
                <AppTabsTrigger
                  key={option.value}
                  value={option.value}
                  disabled={isLoading}
                >
                  <FaIcon icon={TERM_TYPE_ICONS[option.value]} size="xs" />
                  {option.shortLabel}
                </AppTabsTrigger>
              ))}
            </AppTabsList>
          </AppTabs>
        </KvFieldFrame>

        <KvSelectField
          label={`عملیات در حال انجام (${activeTermTypeOption.shortLabel})`}
          required
          size="md"
          disabled={isLoading}
          value={editTermId || '__new__'}
          displayValue={
            editTermId
              ? `ویرایش دوره: ${formatTermOptionLabel(
                  terms.find((term) => term.id === editTermId)?.title ?? ''
                )}`
              : `-- ایجاد ${activeTermTypeOption.shortLabel} جدید --`
          }
          onValueChange={(value) =>
            onSelectEditTerm(value === '__new__' ? '' : value)
          }
        >
          <KvSelectItem value="__new__">
            -- ایجاد {activeTermTypeOption.shortLabel} جدید --
          </KvSelectItem>
          {termsForActiveType.map((term) => (
            <KvSelectItem key={term.id} value={term.id}>
              ویرایش دوره: {formatTermOptionLabel(term.title)}
            </KvSelectItem>
          ))}
        </KvSelectField>

        <div className="space-y-kv-group rounded-kv-control border border-kv-border-muted bg-kv-surface-subtle/60 p-kv-group">
          <div className="flex items-center gap-1.5">
            <FaIcon
              icon={TERM_TYPE_ICONS[termType]}
              size="xs"
              className="text-kv-brand-soft-fg"
            />
            <KvTypography variant="caption" weight="bold" tone="muted">
              تنظیمات بازه برای «{activeTermTypeOption.shortLabel}»
            </KvTypography>
          </div>

          <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
            <KvSelectField
              label={
                termType === 'modular'
                  ? 'عنوان بازه پودمان'
                  : 'عنوان بازه نیم‌سال'
              }
              required
              size="md"
              disabled={isLoading}
              value={termPrefix}
              displayValue={toPersianDigits(termPrefix)}
              onValueChange={onTermPrefixChange}
            >
              {prefixOptions.map((prefix) => (
                <KvSelectItem key={prefix} value={prefix}>
                  {toPersianDigits(prefix)}
                </KvSelectItem>
              ))}
            </KvSelectField>

            <KvTextField
              id="syllabus-term-academic-year"
              label="سال تحصیلی"
              required
              size="md"
              dir="ltr"
              scriptGuard="none"
              disabled={isLoading}
              value={displayAcademicYear(termYear)}
              placeholder="۱۴۰۵-۱۴۰۶"
              error={academicYearError ?? undefined}
              onChange={(event) =>
                onTermYearChange(
                  persianToEnglishDigits(event.target.value).replace(
                    /[^\d-]/g,
                    ''
                  )
                )
              }
            />
          </div>
        </div>

        {formError ? (
          <KvTypography variant="caption" tone="danger">
            {formError}
          </KvTypography>
        ) : null}

        <div className="flex flex-col gap-2 border-t border-kv-border-muted pt-kv-group sm:flex-row sm:flex-wrap sm:justify-end">
          {isEditing ? (
            <KvButton
              type="button"
              color="error"
              size="md"
              className="w-full sm:w-auto"
              onClick={onRequestDelete}
              disabled={isLoading || isSaving}
              icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
            >
              حذف این دوره
            </KvButton>
          ) : null}
          <KvButton
            type="button"
            color="cta"
            size="md"
            className="w-full sm:w-auto"
            loading={isSaving}
            disabled={isLoading || isSaving || !canSubmit}
            onClick={onSave}
          >
            {isEditing ? 'ذخیره تغییرات دوره' : 'ایجاد دوره تحصیلی'}
          </KvButton>
        </div>
      </KvCardContent>
    </KvCard>
  );
}
