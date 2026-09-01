'use client';

import { useEffect, useMemo } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { QUERY_STALE_MS } from '@/lib/query-stale';
import { IS_MOCK_MODE } from '@/lib/api-mode';
import { OrgStructureService } from '@/services/org-structure.service';
import type { OrgStructureListItem } from '@/services/org-structure.service';
import type {
  OrgCity,
  OrgDistrict,
  OrgMajor,
  OrgProvince,
  OrgRole,
  OrgSchool,
  OrgStructureEntityKind,
  OrgStructureSubTab,
} from '@/types/org-structure';

import { ORG_STRUCTURE_CACHE_NAMESPACE } from '../lib/orgStructureListKeys';
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
  if (tab === 'majors') {
    return IS_MOCK_MODE
      ? { name: '', audience: undefined }
      : { name: '', roleId: '' };
  }
  if (tab === 'cities' || tab === 'faculties') {
    return { name: '', provinceId: '' };
  }
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
 * مقادیر `reset()` را از ردیف جدول بساز تا ویرایش به `getEntity()` دوم وابسته نباشد.
 * در real فقط `province` واقعاً resolve می‌شود؛ بقیه kindها silent no-op می‌مانند.
 *
 * ردیف real همیشه کلید FK دارد (`provinceId`/`cityId`/…) حتی اگر `''` باشد.
 * ردیف mock اصلاً آن کلیدها را ندارد (فقط برچسب `*Name`).
 * پس چک درست `=== undefined` است نه falsy — وگرنه ردیف real با یک رابطهٔ خالی هم رد می‌شود.
 */
function valuesFromRow(
  kind: OrgStructureEntityKind,
  row: OrgStructureListItem
): OrgEntityFormValues | null {
  if (kind === 'province') {
    return { name: row.name };
  }
  if (kind === 'major') {
    if (IS_MOCK_MODE) {
      if (row.audience === undefined) return null;
      return { name: row.name, audience: row.audience };
    }
    if (row.roleId === undefined) return null;
    return { name: row.name, roleId: row.roleId };
  }
  if (kind === 'city') {
    if (row.provinceId === undefined) return null;
    return { name: row.name, provinceId: row.provinceId };
  }
  if (kind === 'faculty') {
    if (row.provinceId === undefined) return null;
    return { name: row.name, provinceId: row.provinceId };
  }
  if (kind === 'district') {
    if (row.provinceId === undefined || row.cityId === undefined) return null;
    return { name: row.name, provinceId: row.provinceId, cityId: row.cityId };
  }
  if (kind === 'school') {
    if (
      row.provinceId === undefined ||
      row.cityId === undefined ||
      row.districtId === undefined ||
      row.gender === undefined
    ) {
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

  // فهرست select با react-query کش می‌شود؛ بازکردن دوبارهٔ مودال نباید چند ثانیه خالی بماند.
  const provincesQuery = useQuery({
    queryKey: [ORG_STRUCTURE_CACHE_NAMESPACE, 'provinces'],
    queryFn: () => OrgStructureService.listProvinces(),
    staleTime: QUERY_STALE_MS.list,
    enabled: open,
  });

  const citiesQuery = useQuery({
    queryKey: [ORG_STRUCTURE_CACHE_NAMESPACE, 'cities', provinceId],
    queryFn: () => OrgStructureService.listCities(provinceId as string),
    staleTime: QUERY_STALE_MS.list,
    enabled:
      open &&
      Boolean(provinceId) &&
      (tab === 'districts' || tab === 'schools'),
    placeholderData: keepPreviousData,
  });

  const districtsQuery = useQuery({
    queryKey: [
      ORG_STRUCTURE_CACHE_NAMESPACE,
      'districts',
      provinceId,
      cityId || '',
    ],
    queryFn: () =>
      OrgStructureService.listDistricts(
        provinceId as string,
        cityId || undefined
      ),
    staleTime: QUERY_STALE_MS.list,
    // لایو: GET `/admin/educations?provinceId&cityId` خطای ۵۰۰ می‌دهد —
    // فرم مدرسه باید منطقه را با انتخاب استان لود کند، نه بعد از شهر.
    // `listRealDistricts` روی سیم `cityId` را حذف می‌کند.
    enabled: open && tab === 'schools' && Boolean(provinceId),
    placeholderData: keepPreviousData,
  });

  // فقط real — نقش متصل به رشته. mock مفهوم نقش Nest ندارد و enum `audience` می‌ماند.
  const rolesQuery = useQuery({
    queryKey: [ORG_STRUCTURE_CACHE_NAMESPACE, 'roles'],
    queryFn: () => OrgStructureService.listRoles(),
    staleTime: QUERY_STALE_MS.list,
    enabled: open && tab === 'majors' && !IS_MOCK_MODE,
  });

  const provinces: OrgProvince[] = provincesQuery.data ?? [];
  const cities: OrgCity[] = provinceId ? (citiesQuery.data ?? []) : [];
  const editDistrictId = editRow?.districtId;
  const editDistrictName = editRow?.districtName;
  const editDistrictProvinceId = editRow?.provinceId ?? '';
  const editDistrictCityId = editRow?.cityId ?? '';
  const districts = useMemo((): OrgDistrict[] => {
    const fromQuery: OrgDistrict[] =
      tab === 'schools' && provinceId ? (districtsQuery.data ?? []) : [];
    if (
      editDistrictId &&
      editDistrictName &&
      !fromQuery.some((d) => d.id === editDistrictId)
    ) {
      return [
        ...fromQuery,
        {
          id: editDistrictId,
          name: editDistrictName,
          provinceId: editDistrictProvinceId,
          cityId: editDistrictCityId,
        },
      ];
    }
    return fromQuery;
  }, [
    tab,
    provinceId,
    districtsQuery.data,
    editDistrictId,
    editDistrictName,
    editDistrictProvinceId,
    editDistrictCityId,
  ]);
  const roles: OrgRole[] = tab === 'majors' ? (rolesQuery.data ?? []) : [];

  /**
   * استان انتخاب شده، کوئری شهر تمام شده، و واقعاً شهری نیست.
   * select شهر در فرم منطقه/مدرسه را قفل می‌کند.
   */
  const provinceHasNoCities =
    Boolean(provinceId) &&
    citiesQuery.isFetched &&
    !citiesQuery.isFetching &&
    cities.length === 0;

  useEffect(() => {
    if (!open) return;

    // اول *مقادیر* فرم را پر کن — منتظر کوئری استان نمان؛ آن فقط optionهای select است.
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

    // فقط fallback: ردیف قابل‌استفاده نیست (mock کلید FK ندارد).
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

        if (entityKind === 'faculty') {
          const faculty = entity as { name: string; provinceId: string };
          form.reset({ name: faculty.name, provinceId: faculty.provinceId });
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

  useEffect(() => {
    if (!open || tab !== 'schools' || !editId) return;
    if (form.getValues('districtId')) return;
    if (editRow?.districtId) {
      form.setValue('districtId', editRow.districtId);
      return;
    }
    const label = editRow?.districtName?.trim();
    if (!label) return;
    const match = districts.find((d) => d.name === label);
    if (match) form.setValue('districtId', match.id);
  }, [open, tab, editId, editRow, districts, form]);

  return {
    form,
    provinces,
    cities,
    districts,
    roles,
    provinceHasNoCities,
  };
}
