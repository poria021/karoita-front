'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvCardTitleIcon } from '@/components/shared/KvCardTitleIcon';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
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
  isSaving: boolean;
  formError?: string | null;
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
  onSave,
  onRequestDelete,
  isLoading = false,
}: TermFormCardProps) {
  const isEditing = Boolean(editTermId);
  const prefixOptions =
    termType === 'modular' ? MODULAR_PREFIX_OPTIONS : SEMESTER_PREFIX_OPTIONS;

  return (
    <KvCard>
      <KvCardContent padding="md" className="space-y-kv-group">
        <div className="flex items-center gap-kv-pair border-b border-kv-border pb-kv-pair">
          <KvCardTitleIcon icon={faIcons.plus} />
          <div className="min-w-0">
            <KvTypography variant="subtitle" weight="black" as="h4">
              تعریف و ساختارسازی ترم جدید
            </KvTypography>
            <KvTypography variant="caption" tone="muted" as="p">
              ساختار ترمی برای دانشجویان و پودمانی برای مهارت‌آموزان اعمال می‌شود.
            </KvTypography>
          </div>
        </div>

        {isLoading ? (
          <>
            <div className="space-y-kv-pair">
              <KvTypography variant="label" as="label">
                عملیات در حال انجام <span className="text-kv-danger">*</span>
              </KvTypography>
              <KvSkeleton className="h-11 w-full rounded-kv-control bg-kv-border" />
            </div>

            <div className="space-y-kv-pair">
              <KvTypography variant="label" as="label">
                نوع ساختار دوره <span className="text-kv-danger">*</span>
              </KvTypography>
              <KvSkeleton className="h-11 w-full rounded-kv-control bg-kv-border" />
            </div>

            <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
              <div className="space-y-kv-pair">
                <KvTypography variant="label" as="label">
                  عنوان بازه <span className="text-kv-danger">*</span>
                </KvTypography>
                <KvSkeleton className="h-11 w-full rounded-kv-control bg-kv-border" />
              </div>
              <div className="space-y-kv-pair">
                <KvTypography variant="label" as="label">
                  سال تحصیلی <span className="text-kv-danger">*</span>
                </KvTypography>
                <KvSkeleton className="h-11 w-full rounded-kv-control bg-kv-border" />
              </div>
            </div>
          </>
        ) : (
          <>
            <KvSelectField
              label="عملیات در حال انجام"
              required
              size="md"
              value={editTermId || '__new__'}
              displayValue={
                editTermId
                  ? `ویرایش دوره: ${toPersianDigits(
                      terms.find((term) => term.id === editTermId)?.title ?? ''
                    )}`
                  : '-- ایجاد و تعریف دوره تحصیلی جدید --'
              }
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
                displayValue={toPersianDigits(termPrefix)}
                disabled={isEditing}
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
                disabled={isEditing}
                value={displayAcademicYear(termYear)}
                placeholder="۱۴۰۵-۱۴۰۶"
                onChange={(event) =>
                  onTermYearChange(persianToEnglishDigits(event.target.value))
                }
              />
            </div>
          </>
        )}

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
              disabled={isLoading}
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
              disabled={isLoading}
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
