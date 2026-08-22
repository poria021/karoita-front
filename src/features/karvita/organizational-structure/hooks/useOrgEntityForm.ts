'use client';

import { useEffect } from 'react';
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
 * kind.
 *
 * Real-mode rows always carry the FK keys (provinceId/cityId/...), even
 * when their value ends up '' (e.g. a city with no province linked on
 * the backend) — toOrgCity/toOrgDistrict/toOrgSchool always set them.
 * Mock-mode rows never carry them at all (only *Name display labels).
 * So `=== undefined` (key absent → mock, needs the getEntity fallback)
 * is the right check here, not falsy (which would also reject a real
 * row that's merely missing that one relation and needs the name +
 * whatever *is* linked to show immediately either way).
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
  if (kind === 'district' || kind === 'faculty') {
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

  // Option lists for the selects below are cached via react-query — keyed
  // by namespace + params, shared across every tab and every dialog open.
  // The first province/city/district fetch in a session still pays a real
  // network round trip, but re-opening any edit dialog afterwards (any
  // tab, any row) reads from cache instead of re-fetching, so the selects
  // no longer show a multi-second blank/placeholder state each time.
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
    enabled: open && Boolean(provinceId),
    placeholderData: keepPreviousData,
  });

  const districtsQuery = useQuery({
    queryKey: [ORG_STRUCTURE_CACHE_NAMESPACE, 'districts', provinceId, cityId],
    queryFn: () =>
      OrgStructureService.listDistricts(provinceId as string, cityId as string),
    staleTime: QUERY_STALE_MS.list,
    enabled: open && tab === 'schools' && Boolean(provinceId) && Boolean(cityId),
    placeholderData: keepPreviousData,
  });

  // Real mode only — the role a degree/major links to. Mock mode has no
  // Nest role concept and keeps using the fixed audience enum instead.
  const rolesQuery = useQuery({
    queryKey: [ORG_STRUCTURE_CACHE_NAMESPACE, 'roles'],
    queryFn: () => OrgStructureService.listRoles(),
    staleTime: QUERY_STALE_MS.list,
    enabled: open && tab === 'majors' && !IS_MOCK_MODE,
  });

  const provinces: OrgProvince[] = provincesQuery.data ?? [];
  const cities: OrgCity[] = provinceId ? (citiesQuery.data ?? []) : [];
  const districts: OrgDistrict[] =
    tab === 'schools' && provinceId && cityId ? (districtsQuery.data ?? []) : [];
  const roles: OrgRole[] = tab === 'majors' ? (rolesQuery.data ?? []) : [];

  /**
   * True when an province is selected, the cities query has finished, and
   * that province genuinely has no cities. Used by the city select in the
   * districts tab to lock the field and make it optional.
   */
  const provinceHasNoCities =
    Boolean(provinceId) &&
    citiesQuery.isFetched &&
    !citiesQuery.isFetching &&
    cities.length === 0;

  useEffect(() => {
    if (!open) return;

    // Populate the form's *values* first, synchronously where possible —
    // this must not wait on the provinces query above, which only feeds
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

  return {
    form,
    provinces,
    cities,
    districts,
    roles,
    provinceHasNoCities,
  };
}
