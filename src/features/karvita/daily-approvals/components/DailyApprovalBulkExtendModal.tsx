'use client';

import { useCallback, useMemo, useState } from 'react';

import { KvButton } from '@/components/shared/KvButton';
import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogFooter,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import { KvCheckboxMultiSelect } from '@/components/shared/fields/KvCheckboxMultiSelect';
import { KvFieldFrame } from '@/components/shared/fields/KvFieldFrame';
import { KvTypography } from '@/components/shared/KvTypography';
import type {
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalTrainee,
} from '@/types/daily-approvals';
import { collectExtendedWeekNumbers } from '../lib/collectExtendedWeekNumbers';

import { useDailyApprovalBulkExtendCatalog } from '../hooks/useDailyApprovalBulkExtendCatalog';

type DailyApprovalBulkExtendModalProps = {
  open: boolean;
  kind: DailyApprovalCourseKind;
  termId: string;
  preferredCourse: DailyApprovalCourseFilter;
  busy: boolean;
  trainees: readonly DailyApprovalTrainee[];
  onClose: () => void;
  onConfirm: (input: {
    course: Exclude<DailyApprovalCourseFilter, 'all'>;
    weekNumbers: number[];
    revokeWeekNumbers: number[];
  }) => void;
};

export function DailyApprovalBulkExtendModal({
  open,
  kind,
  termId,
  preferredCourse,
  busy,
  trainees,
  onClose,
  onConfirm,
}: DailyApprovalBulkExtendModalProps) {
  const catalog = useDailyApprovalBulkExtendCatalog({
    open,
    kind,
    termId,
    preferredCourse,
  });
  const options = catalog.weekOptions;
  const selectedCourseFilter = catalog.selectedCourse?.courseFilter;
  const [error, setError] = useState<string | undefined>();

  const baselineKey = useMemo(() => {
    const allowedValues = new Set(options.map((option) => option.value));
    return collectExtendedWeekNumbers(trainees, selectedCourseFilter)
      .filter((weekNumber) => Number.isInteger(weekNumber) && weekNumber > 0)
      .map((weekNumber) => String(weekNumber))
      .filter((value) => allowedValues.has(value))
      .join(',');
  }, [options, selectedCourseFilter, trainees]);

  const baselineExtendedValues = useMemo(
    () => (baselineKey ? baselineKey.split(',') : []),
    [baselineKey]
  );

  const [selectedValues, setSelectedValues] = useState<string[]>(() => baselineExtendedValues);

  const resetForm = useCallback(() => {
    setSelectedValues(baselineExtendedValues);
    setError(undefined);
  }, [baselineExtendedValues]);

  const submit = () => {
    const courseFilter = catalog.selectedCourse?.courseFilter;
    if (!courseFilter) {
      setError('ابتدا یک درس را انتخاب کنید.');
      return;
    }
    if (catalog.weeksPending || options.length === 0) {
      setError('هفته‌های این درس هنوز آماده نیست.');
      return;
    }
    const selectedWeekNumbers = selectedValues
      .map((value) => Number(value))
      .filter((weekNumber) => Number.isInteger(weekNumber) && weekNumber > 0);
    const baselineSet = new Set(
      baselineExtendedValues
        .map((value) => Number(value))
        .filter((weekNumber) => Number.isInteger(weekNumber) && weekNumber > 0)
    );
    const selectedSet = new Set(selectedWeekNumbers);

    const weekNumbers = selectedWeekNumbers
      .filter((weekNumber) => !baselineSet.has(weekNumber))
      .sort((left, right) => left - right);
    const revokeWeekNumbers = [...baselineSet]
      .filter((weekNumber) => !selectedSet.has(weekNumber))
      .sort((left, right) => left - right);

    if (weekNumbers.length === 0 && revokeWeekNumbers.length === 0) {
      setError('تغییری نسبت به هفته‌های تمدیدشده فعلی اعمال نشده است.');
      return;
    }
    setError(undefined);
    onConfirm({ course: courseFilter, weekNumbers, revokeWeekNumbers });
  };

  const weeksPlaceholder = catalog.weeksPending
    ? 'در حال بارگذاری هفته‌ها...'
    : catalog.weeksError
      ? catalog.weeksError
      : options.length === 0
        ? 'هفته‌ای برای این درس یافت نشد'
        : 'انتخاب هفته‌ها';

  return (
    <KvDialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          resetForm();
        }
        if (!next && !busy) onClose();
      }}
    >
      <KvDialogContent
        size="md"
        showCloseButton
        onPointerDownOutside={(event) => {
          event.preventDefault();
        }}
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <KvDialogHeader>
          <KvDialogTitle>تمدید گروهی مهلت ارسال گزارش</KvDialogTitle>
          <KvDialogDescription className="sr-only">
            انتخاب درس و هفته‌ها برای تمدید گروهی مهلت ارسال گزارش
          </KvDialogDescription>
        </KvDialogHeader>

        <div className="space-y-kv-group">
          <KvFieldFrame
            id="daily-approval-bulk-extend-course"
            label="درس"
            required
            error={catalog.coursesError ?? undefined}
            hint={
              !catalog.coursesPending &&
              !catalog.coursesError &&
              catalog.courses.length === 0
                ? 'برای این نیم‌سال درسی یافت نشد.'
                : undefined
            }
          >
            {catalog.coursesPending ? (
              <KvTypography variant="caption" tone="muted" as="p">
                در حال بارگذاری دروس...
              </KvTypography>
            ) : catalog.courses.length > 0 ? (
              <div
                id="daily-approval-bulk-extend-course"
                role="radiogroup"
                aria-label="انتخاب درس"
                className="flex w-full items-stretch gap-kv-pair"
              >
                {catalog.courses.map((course) => {
                  const selected = course.id === catalog.selectedCourse?.id;
                  return (
                    <KvButton
                      key={course.id}
                      type="button"
                      size="xs"
                      color={selected ? 'cta' : 'neutral'}
                      appearance={selected ? 'solid' : 'secondary'}
                      disabled={busy}
                      aria-checked={selected}
                      role="radio"
                      className="min-w-0 flex-1 justify-center text-center"
                      onClick={() => catalog.setLessonId(course.id)}
                    >
                      {course.title}
                    </KvButton>
                  );
                })}
              </div>
            ) : null}
          </KvFieldFrame>

          <KvCheckboxMultiSelect
            id="daily-approval-bulk-extend-weeks"
            label="هفته‌های قابل تمدید"
            required
            options={options}
            values={selectedValues}
            onValuesChange={(next) => {
              setSelectedValues(next);
              if (next.length > 0 || baselineExtendedValues.length > 0) {
                setError(undefined);
              }
            }}
            placeholder={weeksPlaceholder}
            disabled={
              busy ||
              catalog.weeksPending ||
              options.length === 0 ||
              !catalog.selectedCourse
            }
            error={error ?? catalog.weeksError ?? undefined}
          />
        </div>

        <KvDialogFooter>
          <KvButton
            type="button"
            color="neutral"
            appearance="secondary"
            size="md"
            disabled={busy}
            onClick={onClose}
          >
            انصراف
          </KvButton>
          <KvButton
            type="button"
            color="violet"
            appearance="solid"
            size="md"
            loading={busy}
            disabled={
              busy ||
              catalog.weeksPending ||
              !catalog.selectedCourse ||
              options.length === 0
            }
            onClick={submit}
          >
            اعمال تمدید گروهی
          </KvButton>
        </KvDialogFooter>
      </KvDialogContent>
    </KvDialog>
  );
}
