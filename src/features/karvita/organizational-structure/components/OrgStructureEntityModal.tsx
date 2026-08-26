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
import type { OrgStructureListItem } from '@/services/org-structure.service';
import type {
  OrgStructureEntityKind,
  OrgStructureSubTab,
} from '@/types/org-structure';

import { getOrgTabConfig } from '../constants';
import { useOrgEntityForm } from '../hooks/useOrgEntityForm';
import { submitOrgEntity } from '../lib/orgEntitySubmitHandlers';
import type { OrgEntityFormValues } from '../schemas/org-structure.schema';
import { OrgStructureEntityFields } from './OrgStructureEntityFields';

interface OrgStructureEntityModalProps {
  open: boolean;
  tab: OrgStructureSubTab;
  entityKind: OrgStructureEntityKind;
  editId: string | null;
  editRow: OrgStructureListItem | null;
  onClose: () => void;
  /** پس از ویرایش موفق: کش باطل می‌کنه و جدول را reload می‌دهد. */
  onSaved: () => Promise<void>;
  onCreate: (values: OrgEntityFormValues) => void;
}

export function OrgStructureEntityModal({
  open,
  tab,
  entityKind,
  editId,
  editRow,
  onClose,
  onSaved,
  onCreate,
}: OrgStructureEntityModalProps) {
  const tabConfig = getOrgTabConfig(tab);
  const isEdit = Boolean(editId);
  const [formError, setFormError] = useState<string | null>(null);

  const { form, provinces, cities, districts, roles, provinceHasNoCities } = useOrgEntityForm({
    open,
    tab,
    entityKind,
    editId,
    editRow,
  });

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    const label = values.name.trim();

    if (isEdit) {
      try {
        await submitOrgEntity(tab, values, editId);
        toast.success(`${tabConfig.addLabel} «${label}» به‌روزرسانی شد.`);
        // onSaved کش را flush و جدول را reload می‌کنه — باید await بشه
        // تا اطمینان حاصل بشه قبل از بستن مدال، خطای راس‌اندازی catch نمی‌شه.
        await onSaved();
        onClose();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'ذخیره ناموفق بود.');
      }
      return;
    }

    onClose();
    onCreate(values);
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
            roles={roles}
            namePlaceholder={tabConfig.namePlaceholder}
            provinceHasNoCities={provinceHasNoCities}
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
