'use client';

import { KvButton } from '@/components/shared/KvButton';
import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogFooter,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import { KvTextField } from '@/components/shared/fields/KvTextField';

interface WeekEditDialogProps {
  open: boolean;
  title: string;
  onTitleChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function WeekEditDialog({
  open,
  title,
  onTitleChange,
  onClose,
  onSave,
}: WeekEditDialogProps) {
  return (
    <KvDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <KvDialogContent size="md">
        <KvDialogHeader>
          <KvDialogTitle>ویرایش عنوان سرفصل هفتگی</KvDialogTitle>
          <KvDialogDescription>
            عنوان جلسه آموزشی را ویرایش کنید؛ سپس ثبت نهایی سرفصل را بزنید.
          </KvDialogDescription>
        </KvDialogHeader>

        <KvTextField
          label="عنوان سرفصل"
          size="md"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
        />

        <KvDialogFooter>
          <KvButton
            type="button"
            appearance="secondary"
            size="md"
            onClick={onClose}
          >
            انصراف
          </KvButton>
          <KvButton type="button" color="cta" size="md" onClick={onSave}>
            ذخیره تغییرات
          </KvButton>
        </KvDialogFooter>
      </KvDialogContent>
    </KvDialog>
  );
}
