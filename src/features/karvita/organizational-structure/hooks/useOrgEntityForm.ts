'use client';

import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OrgStructureService } from '@/services/org-structure.service';
import type {
  OrgCity,
  OrgDistrict,
  OrgMajor,
  OrgProvince,
  OrgSchool,
  OrgStructureEntityKind,
  OrgStructureSubTab,
} from '@/types/org-structure';

import {
  cityFormSchema,
  districtFormSchema,
  facultyFormSchema,
  majorFormSchema,
  provinceFormSchema,
  schoolFormSchema,
  type OrgEntityFormValues,
} from '../schemas/org-structure.schema';

function defaultValuesForTab(tab: OrgStructureSubTab): OrgEntityFormValues {
  if (tab === 'provinces') return { name: '' };
  if (tab === 'majors') return { name: '', audience: undefined };
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

type UseOrgEntityFormParams = {
  open: boolean;
  tab: OrgStructureSubTab;
  entityKind: OrgStructureEntityKind;
  editId: string | null;
};

export function useOrgEntityForm({
  open,
  tab,
  entityKind,
  editId,
}: UseOrgEntityFormParams) {
  const [provinces, setProvinces] = useState<OrgProvince[]>([]);
  const [cities, setCities] = useState<OrgCity[]>([]);
  const [districts, setDistricts] = useState<OrgDistrict[]>([]);

  const form = useForm<OrgEntityFormValues>({
    resolver: resolverForTab(tab),
    defaultValues: defaultValuesForTab(tab),
    mode: 'onSubmit',
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- RHF watch for cascading select dependencies
  const provinceId = form.watch('provinceId');
  // eslint-disable-next-line react-hooks/incompatible-library -- RHF watch for cascading select dependencies
  const cityId = form.watch('cityId');

  // Load provinces and hydrate entity on open
  useEffect(() => {
    if (!open) return;
    void (async () => {
      setProvinces(await OrgStructureService.listProvinces());
      if (!editId) {
        form.reset(defaultValuesForTab(tab));
        return;
      }
      const entity = await OrgStructureService.getEntity(entityKind, editId);
      if (!entity) return;
      if (entityKind === 'province') {
        form.reset({ name: entity.name });
        return;
      }
      if (entityKind === 'major') {
        const major = entity as OrgMajor;
        form.reset({ name: major.name, audience: major.audience });
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
      const row = entity as {
        name: string;
        provinceId: string;
        cityId: string;
      };
      form.reset({
        name: row.name,
        provinceId: row.provinceId,
        cityId: row.cityId,
      });
    })();
  }, [open, editId, entityKind, tab, form]);

  // Load cities when province changes
  useEffect(() => {
    if (!open || !provinceId) {
      setCities([]);
      return;
    }
    void OrgStructureService.listCities(provinceId).then(setCities);
  }, [open, provinceId]);

  // Load districts when city changes (schools only)
  useEffect(() => {
    if (!open || tab !== 'schools' || !provinceId) {
      setDistricts([]);
      return;
    }
    void OrgStructureService.listDistricts(provinceId, cityId).then(
      setDistricts
    );
  }, [open, tab, provinceId, cityId]);

  return {
    form,
    provinces,
    cities,
    districts,
  };
}
