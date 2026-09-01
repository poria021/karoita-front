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
import type { DailyApprovalCourseKind } from '@/types/daily-approvals';

import { getDailyApprovalWeekOptions } from '../constants';

type DailyApprovalBulkExtendModalProps = {
  open: boolean;
  kind: DailyApprovalCourseKind;
  busy: boolean;
  /** شماره هفته‌های از قبل تمدیدشده در گروه فعال — در لیست پیش‌انتخاب. */
  previouslyExtendedWeekNumbers?: readonly number[];
  onClose: () => void;
  onConfirm: (input: {
    weekNumbers: number[];
    revokeWeekNumbers: number[];
  }) => void;
};

export function DailyApprovalBulkExtendModal({
  open,
  kind,
  busy,
  previouslyExtendedWeekNumbers = [],
  onClose,
  onConfirm,
}: DailyApprovalBulkExtendModalProps) {
  const options = getDailyApprovalWeekOptions(kind);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();

  const baselineExtendedValues = useMemo(() => {
    const allowedValues = new Set(options.map((option) => option.value));
    return previouslyExtendedWeekNumbers
      .filter((weekNumber) => Number.isInteger(weekNumber) && weekNumber > 0)
      .map((weekNumber) => String(weekNumber))
      .filter((value) => allowedValues.has(value));
  }, [options, previouslyExtendedWeekNumbers]);

  const resetForm = useCallback(() => {
    setSelectedValues(baselineExtendedValues);
    setError(undefined);
  }, [baselineExtendedValues]);

  const submit = () => {
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
    onConfirm({ weekNumbers, revokeWeekNumbers });
  };

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
            انتخاب هفته‌ها برای تمدید گروهی مهلت ارسال گزارش
          </KvDialogDescription>
        </KvDialogHeader>

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
          placeholder="انتخاب هفته‌ها"
          disabled={busy}
          error={error}
        />

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
            disabled={busy}
            onClick={submit}
          >
            اعمال تمدید گروهی
          </KvButton>
        </KvDialogFooter>
      </KvDialogContent>
    </KvDialog>
  );
}
