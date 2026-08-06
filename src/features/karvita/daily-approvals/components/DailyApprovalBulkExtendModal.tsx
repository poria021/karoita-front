'use client';

import { useEffect, useState } from 'react';

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
import { KvTypography } from '@/components/shared/KvTypography';
import type { DailyApprovalCourseKind } from '@/types/daily-approvals';
import { toPersianDigits } from '@/utils/persianDigits';

import { getDailyApprovalWeekOptions } from '../constants';

type DailyApprovalBulkExtendModalProps = {
  open: boolean;
  kind: DailyApprovalCourseKind;
  busy: boolean;
  onClose: () => void;
  onConfirm: (weekNumbers: number[]) => Promise<void>;
};

export function DailyApprovalBulkExtendModal({
  open,
  kind,
  busy,
  onClose,
  onConfirm,
}: DailyApprovalBulkExtendModalProps) {
  const options = getDailyApprovalWeekOptions(kind);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    setSelectedValues([]);
    setError(undefined);
  }, [open, kind]);

  const kindLabel = kind === 'internship' ? 'کارورزی' : 'کارآموزی';
  const weekCountLabel = toPersianDigits(options.length);

  const submit = async () => {
    if (selectedValues.length === 0) {
      setError('حداقل یک هفته را انتخاب کنید.');
      return;
    }
    setError(undefined);
    const weekNumbers = selectedValues
      .map((value) => Number(value))
      .filter((weekNumber) => Number.isInteger(weekNumber) && weekNumber > 0)
      .sort((left, right) => left - right);
    await onConfirm(weekNumbers);
  };

  return (
    <KvDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onClose();
      }}
    >
      <KvDialogContent
        size="md"
        showCloseButton
        onPointerDownOutside={(event) => {
          if (busy) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <KvDialogHeader>
          <KvDialogTitle>تمدید گروهی مهلت ارسال گزارش</KvDialogTitle>
          <KvDialogDescription>
            هفته‌های موردنظر را برای گروه {kindLabel} ({weekCountLabel} هفته)
            انتخاب کنید. تمدید برای همه کارورزان فعال همین نیم‌سال اعمال می‌شود.
          </KvDialogDescription>
        </KvDialogHeader>

        <div className="flex flex-col gap-kv-group">
          <KvCheckboxMultiSelect
            id="daily-approval-bulk-extend-weeks"
            label="هفته‌های قابل تمدید"
            required
            options={options}
            values={selectedValues}
            onValuesChange={(next) => {
              setSelectedValues(next);
              if (next.length > 0) setError(undefined);
            }}
            placeholder="انتخاب هفته‌ها"
            disabled={busy}
            error={error}
          />
          <KvTypography variant="caption" tone="muted">
            هفته‌های نمره‌گذاری‌شده و کارورزان حذف‌شده در تمدید گروهی نادیده
            گرفته می‌شوند.
          </KvTypography>
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
            disabled={busy}
            onClick={() => void submit()}
          >
            اعمال تمدید گروهی
          </KvButton>
        </KvDialogFooter>
      </KvDialogContent>
    </KvDialog>
  );
}
