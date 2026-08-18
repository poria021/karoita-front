'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
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

  const provinceId = useWatch({
    control: form.control,
    name: 'provinceId',
  });
  const cityId = useWatch({
    control: form.control,
    name: 'cityId',
  });

  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    void (async () => {
      const provincesData = await OrgStructureService.listProvinces();
      if (!isMounted) return;
      setProvinces(provincesData);

      if (!editId) {
        form.reset(defaultValuesForTab(tab));
        return;
      }

      const entity = await OrgStructureService.getEntity(entityKind, editId);
      if (!entity || !isMounted) return;

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

    return () => {
      isMounted = false;
    };
  }, [open, editId, entityKind, tab, form]);

  useEffect(() => {
    if (!open || !provinceId) {
      setCities([]);
      return;
    }

    let isMounted = true;

    void OrgStructureService.listCities(provinceId).then((data) => {
      if (isMounted) {
        setCities(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [open, provinceId]);

  useEffect(() => {
    if (!open || tab !== 'schools') {
      setDistricts([]);
      return;
    }

    if (!provinceId || !cityId) {
      setDistricts([]);
      return;
    }

    let isMounted = true;

    void OrgStructureService.listDistricts(provinceId, cityId).then((data) => {
      if (isMounted) {
        setDistricts(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [open, tab, provinceId, cityId]);

  return {
    form,
    provinces,
    cities,
    districts,
  };
}
