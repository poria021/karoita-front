'use client';

import { useCallback, useEffect, useState } from 'react';
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

  const syncProvinces = useCallback(
    (next: OrgProvince[]) => setProvinces(next),
    []
  );
  const syncCities = useCallback((next: OrgCity[]) => setCities(next), []);
  const syncDistricts = useCallback(
    (next: OrgDistrict[]) => setDistricts(next),
    []
  );

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

  const loadProvinces = useCallback(async () => {
    const provincesData = await OrgStructureService.listProvinces();
    syncProvinces(provincesData);
    return provincesData;
  }, [syncProvinces]);

  const loadCitiesForProvince = useCallback(
    async (nextProvinceId: string) => {
      if (!nextProvinceId) {
        syncCities([]);
        return;
      }

      const data = await OrgStructureService.listCities(nextProvinceId);
      syncCities(data);
    },
    [syncCities]
  );

  const loadDistrictsForCity = useCallback(
    async (nextProvinceId: string, nextCityId: string) => {
      if (!nextProvinceId || !nextCityId || tab !== 'schools') {
        syncDistricts([]);
        return;
      }

      const data = await OrgStructureService.listDistricts(
        nextProvinceId,
        nextCityId
      );
      syncDistricts(data);
    },
    [syncDistricts, tab]
  );

  useEffect(() => {
    if (!open) return;

    const initTimer = window.setTimeout(() => {
      void loadProvinces();

      if (!editId) {
        form.reset(defaultValuesForTab(tab));
        return;
      }

      void (async () => {
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
    }, 0);

    return () => window.clearTimeout(initTimer);
  }, [editId, entityKind, form, loadProvinces, open, tab]);

  useEffect(() => {
    if (!open) {
      const clearTimer = window.setTimeout(() => syncCities([]), 0);
      return () => window.clearTimeout(clearTimer);
    }

    if (!provinceId) {
      const clearTimer = window.setTimeout(() => syncCities([]), 0);
      return () => window.clearTimeout(clearTimer);
    }

    const loadTimer = window.setTimeout(() => {
      void loadCitiesForProvince(provinceId);
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadCitiesForProvince, open, provinceId, syncCities]);

  useEffect(() => {
    if (!open || tab !== 'schools') {
      const clearTimer = window.setTimeout(() => syncDistricts([]), 0);
      return () => window.clearTimeout(clearTimer);
    }

    if (!provinceId || !cityId) {
      const clearTimer = window.setTimeout(() => syncDistricts([]), 0);
      return () => window.clearTimeout(clearTimer);
    }

    const loadTimer = window.setTimeout(() => {
      void loadDistrictsForCity(provinceId, cityId);
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [cityId, loadDistrictsForCity, open, provinceId, syncDistricts, tab]);

  return {
    form,
    provinces,
    cities,
    districts,
  };
}
