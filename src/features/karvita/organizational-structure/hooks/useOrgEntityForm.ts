'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OrgStructureService } from '@/services/org-structure.service';
import type { OrgStructureListItem } from '@/services/org-structure.service';
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

/**
 * Try to build reset() values straight from the row the table already
 * fetched, so editing doesn't depend on a second getEntity() lookup —
 * which, in real (non-mock) mode, only actually resolves 'province'
 * today and silently no-ops (leaving the form blank) for every other
 * kind. Returns null when the row is missing a field the kind needs
 * (e.g. mock-mode rows, which only carry *Name display labels), so the
 * caller can fall back to OrgStructureService.getEntity().
 */
function valuesFromRow(
  kind: OrgStructureEntityKind,
  row: OrgStructureListItem
): OrgEntityFormValues | null {
  if (kind === 'province') {
    return { name: row.name };
  }
  if (kind === 'major') {
    if (!row.audience) return null;
    return { name: row.name, audience: row.audience };
  }
  if (kind === 'city') {
    if (!row.provinceId) return null;
    return { name: row.name, provinceId: row.provinceId };
  }
  if (kind === 'district' || kind === 'faculty') {
    if (!row.provinceId || !row.cityId) return null;
    return { name: row.name, provinceId: row.provinceId, cityId: row.cityId };
  }
  if (kind === 'school') {
    if (!row.provinceId || !row.cityId || !row.districtId || !row.gender) {
      return null;
    }
    return {
      name: row.name,
      provinceId: row.provinceId,
      cityId: row.cityId,
      districtId: row.districtId,
      gender: row.gender,
    };
  }
  return null;
}

type UseOrgEntityFormParams = {
  open: boolean;
  tab: OrgStructureSubTab;
  entityKind: OrgStructureEntityKind;
  editId: string | null;
  editRow: OrgStructureListItem | null;
};

export function useOrgEntityForm({
  open,
  tab,
  entityKind,
  editId,
  editRow,
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

  useEffect(() => {
    if (!open) return;

    // Populate the form's *values* first, synchronously where possible —
    // this must not wait on the provinces fetch below, which only feeds
    // the province <select>'s option list, not the values themselves.
    if (!editId) {
      form.reset(defaultValuesForTab(tab));
      return;
    }

    if (editRow) {
      const rowValues = valuesFromRow(entityKind, editRow);
      if (rowValues) {
        form.reset(rowValues);
        return;
      }
    }

    // Fallback only: no usable row (mock-mode rows don't carry FK ids).
    const fetchTimer = window.setTimeout(() => {
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

    return () => window.clearTimeout(fetchTimer);
  }, [editId, editRow, entityKind, form, open, tab]);

  // Province <select> options — loaded independently/in parallel with the
  // value population above, so a slow provinces page-through never delays
  // the name/select values from appearing.
  useEffect(() => {
    if (!open) return;

    const optionsTimer = window.setTimeout(() => {
      void (async () => {
        const provincesData = await OrgStructureService.listProvinces();
        syncProvinces(provincesData);
      })();
    }, 0);

    return () => window.clearTimeout(optionsTimer);
  }, [open, syncProvinces]);

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
      void (async () => {
        const data = await OrgStructureService.listCities(provinceId);
        syncCities(data);
      })();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [open, provinceId, syncCities]);

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
      void (async () => {
        const data = await OrgStructureService.listDistricts(provinceId, cityId);
        syncDistricts(data);
      })();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [cityId, open, provinceId, syncDistricts, tab]);

  return {
    form,
    provinces,
    cities,
    districts,
  };
}
