'use client';

import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { KvButton } from '@/components/shared/KvButton';
import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogFooter,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import { OrgStructureService } from '@/services/org-structure.service';
import type {
  OrgCity,
  OrgDistrict,
  OrgProvince,
  OrgSchool,
  OrgStructureEntityKind,
  OrgStructureSubTab,
} from '@/types/org-structure';

import { getOrgTabConfig } from '../constants';
import {
  cityFormSchema,
  districtFormSchema,
  facultyFormSchema,
  majorFormSchema,
  provinceFormSchema,
  schoolFormSchema,
} from '../schemas/org-structure.schema';
import { OrgStructureEntityFields } from './OrgStructureEntityFields';

interface OrgStructureEntityModalProps {
  open: boolean;
  tab: OrgStructureSubTab;
  entityKind: OrgStructureEntityKind;
  editId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export type OrgEntityFormValues = {
  name: string;
  provinceId?: string;
  cityId?: string;
  districtId?: string;
  gender?: 'male' | 'female';
};

function defaultValuesForTab(tab: OrgStructureSubTab): OrgEntityFormValues {
  if (tab === 'provinces' || tab === 'majors') return { name: '' };
  if (tab === 'cities') return { name: '', provinceId: '' };
  if (tab === 'schools') {
    return {
      name: '',
      provinceId: '',
      cityId: '',
      districtId: '',
      gender: undefined,
    };
  }
  return { name: '', provinceId: '', cityId: '' };
}

function resolverForTab(
  tab: OrgStructureSubTab
): Resolver<OrgEntityFormValues> {
  if (tab === 'provinces') {
    return zodResolver(provinceFormSchema) as Resolver<OrgEntityFormValues>;
  }
  if (tab === 'cities') {
    return zodResolver(cityFormSchema) as Resolver<OrgEntityFormValues>;
  }
  if (tab === 'faculties') {
    return zodResolver(facultyFormSchema) as Resolver<OrgEntityFormValues>;
  }
  if (tab === 'districts') {
    return zodResolver(districtFormSchema) as Resolver<OrgEntityFormValues>;
  }
  if (tab === 'schools') {
    return zodResolver(schoolFormSchema) as Resolver<OrgEntityFormValues>;
  }
  return zodResolver(majorFormSchema) as Resolver<OrgEntityFormValues>;
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
  const [provinces, setProvinces] = useState<OrgProvince[]>([]);
  const [cities, setCities] = useState<OrgCity[]>([]);
  const [districts, setDistricts] = useState<OrgDistrict[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<OrgEntityFormValues>({
    resolver: resolverForTab(tab),
    defaultValues: defaultValuesForTab(tab),
    mode: 'onSubmit',
  });

  const provinceId = form.watch('provinceId');
  const cityId = form.watch('cityId');

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    void (async () => {
      setProvinces(await OrgStructureService.listProvinces());
      if (!editId) {
        form.reset(defaultValuesForTab(tab));
        return;
      }
      const entity = await OrgStructureService.getEntity(entityKind, editId);
      if (!entity) return;
      if (entityKind === 'province' || entityKind === 'major') {
        form.reset({ name: entity.name });
        return;
      }
      if (entityKind === 'city') {
        const city = entity as OrgCity;
        form.reset({ name: city.name, provinceId: city.provinceId });
        return;
      }
      if (entityKind === 'school') {
        const school = entity as OrgSchool;
        form.reset({
          name: school.name,
          provinceId: school.provinceId,
          cityId: school.cityId,
          districtId: school.districtId,
          gender: school.gender,
        });
        return;
      }
      const row = entity as { name: string; provinceId: string; cityId: string };
      form.reset({
        name: row.name,
        provinceId: row.provinceId,
        cityId: row.cityId,
      });
    })();
  }, [open, editId, entityKind, tab, form]);

  useEffect(() => {
    if (!open || !provinceId) {
      setCities([]);
      return;
    }
    void OrgStructureService.listCities(provinceId).then(setCities);
  }, [open, provinceId]);

  useEffect(() => {
    if (!open || tab !== 'schools' || !provinceId) {
      setDistricts([]);
      return;
    }
    void OrgStructureService.listDistricts(provinceId, cityId).then(setDistricts);
  }, [open, tab, provinceId, cityId]);

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (tab === 'provinces') {
        await OrgStructureService.upsertProvince(
          { name: values.name },
          editId ?? undefined
        );
      } else if (tab === 'cities') {
        await OrgStructureService.upsertCity(
          { name: values.name, provinceId: values.provinceId! },
          editId ?? undefined
        );
      } else if (tab === 'faculties') {
        await OrgStructureService.upsertFaculty(
          {
            name: values.name,
            provinceId: values.provinceId!,
            cityId: values.cityId!,
          },
          editId ?? undefined
        );
      } else if (tab === 'districts') {
        await OrgStructureService.upsertDistrict(
          {
            name: values.name,
            provinceId: values.provinceId!,
            cityId: values.cityId!,
          },
          editId ?? undefined
        );
      } else if (tab === 'schools') {
        await OrgStructureService.upsertSchool(
          {
            name: values.name,
            provinceId: values.provinceId!,
            cityId: values.cityId!,
            districtId: values.districtId!,
            gender: values.gender!,
          },
          editId ?? undefined
        );
      } else {
        await OrgStructureService.upsertMajor(
          { name: values.name },
          editId ?? undefined
        );
      }
      onSaved();
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'ذخیره ناموفق بود.');
    }
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
            <p role="alert" className="text-xs font-bold text-kv-danger">
              {formError}
            </p>
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
