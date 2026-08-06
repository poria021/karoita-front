'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { KvButton } from '@/components/shared/KvButton';
import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogFooter,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import { KvTypography } from '@/components/shared/KvTypography';
import { scheduleUndoableMutation } from '@/lib/undoable-mutation';
import type {
  OrgStructureEntityKind,
  OrgStructureSubTab,
} from '@/types/org-structure';

import { getOrgTabConfig } from '../constants';
import { useOrgEntityForm } from '../hooks/useOrgEntityForm';
import { submitOrgEntity } from '../lib/orgEntitySubmitHandlers';
import { OrgStructureEntityFields } from './OrgStructureEntityFields';

interface OrgStructureEntityModalProps {
  open: boolean;
  tab: OrgStructureSubTab;
  entityKind: OrgStructureEntityKind;
  editId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function OrgStructureEntityModal({
  open,
  tab,
  entityKind,
  editId,
  onClose,
  onSaved,
}: OrgStructureEntityModalProps) {
  const tabConfig = getOrgTabConfig(tab);
  const isEdit = Boolean(editId);
  const [formError, setFormError] = useState<string | null>(null);

  const { form, provinces, cities, districts } = useOrgEntityForm({
    open,
    tab,
    entityKind,
    editId,
  });

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    const label = values.name.trim();

    if (isEdit) {
      try {
        await submitOrgEntity(tab, values, editId);
        toast.success(`${tabConfig.addLabel} «${label}» به‌روزرسانی شد.`);
        onSaved();
        onClose();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'ذخیره ناموفق بود.');
      }
      return;
    }

    onClose();
    scheduleUndoableMutation({
      message: `${tabConfig.addLabel} «${label}» تا چند ثانیه دیگر افزوده می‌شود…`,
      undoLabel: 'لغو',
      commit: () => submitOrgEntity(tab, values, null),
      onCommitted: async () => {
        toast.success(`${tabConfig.addLabel} «${label}» با موفقیت افزوده شد.`);
        onSaved();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : 'افزودن ساختار ناموفق بود.'
        );
      },
    });
  });

  return (
    <KvDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !form.formState.isSubmitting) onClose();
      }}
    >
      <KvDialogContent
        size="md"
        onPointerDownOutside={(event) => {
          if (form.formState.isSubmitting) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (form.formState.isSubmitting) event.preventDefault();
        }}
      >
        <KvDialogHeader>
          <KvDialogTitle>
            {isEdit ? 'ویرایش' : 'افزودن'} {tabConfig.addLabel}
          </KvDialogTitle>
          <KvDialogDescription className="sr-only">
            فرم {isEdit ? 'ویرایش' : 'افزودن'} {tabConfig.addLabel} در ساختار
            سازمانی
          </KvDialogDescription>
        </KvDialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-kv-group" noValidate>
          <OrgStructureEntityFields
            tab={tab}
            register={form.register}
            control={form.control}
            setValue={form.setValue}
            errors={form.formState.errors}
            provinces={provinces}
            cities={cities}
            districts={districts}
            namePlaceholder={tabConfig.namePlaceholder}
          />

          {formError ? (
            <div role="alert">
              <KvTypography variant="error">{formError}</KvTypography>
            </div>
          ) : null}

          <KvDialogFooter>
            <KvButton
              type="button"
              appearance="secondary"
              size="md"
              onClick={onClose}
              disabled={form.formState.isSubmitting}
            >
              انصراف
            </KvButton>
            <KvButton
              type="submit"
              color="cta"
              appearance="solid"
              size="md"
              loading={form.formState.isSubmitting}
            >
              ذخیره
            </KvButton>
          </KvDialogFooter>
        </form>
      </KvDialogContent>
    </KvDialog>
  );
}
