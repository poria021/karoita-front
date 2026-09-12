import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { QUERY_STALE_MS } from '@/lib/query-stale';
import { IS_MOCK_MODE } from '@/lib/api-mode';
import { OrgStructureService } from '@/services/org-structure.service';
import type {
  OrgCity,
  OrgDistrict,
  OrgProvince,
  OrgRole,
  OrgStructureSubTab,
} from '@/types/org-structure';

import { ORG_STRUCTURE_CACHE_NAMESPACE } from '../lib/orgStructureListKeys';

type UseOrgHierarchyQueriesParams = {
  open: boolean;
  tab: OrgStructureSubTab;
  provinceId: string | undefined;
  cityId: string | undefined;
};

/**
 * کوئری‌های آبشاری province → city → district برای selectهای فرم، به‌علاوهٔ roles.
 * فقط دادهٔ سرور را کش/fetch می‌کند؛ منطق hydration فرم (مقداردهی ویرایش) اینجا نیست.
 */
export function useOrgHierarchyQueries({
  open,
  tab,
  provinceId,
  cityId,
}: UseOrgHierarchyQueriesParams) {
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
      (tab === 'districts' || tab === 'schools' || tab === 'faculties'),
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

  const rolesQuery = useQuery({
    queryKey: [ORG_STRUCTURE_CACHE_NAMESPACE, 'roles'],
    queryFn: () => OrgStructureService.listRoles(),
    staleTime: QUERY_STALE_MS.list,
    enabled: open && tab === 'majors' && !IS_MOCK_MODE,
  });

  const provinces: OrgProvince[] = provincesQuery.data ?? [];
  const cities: OrgCity[] = provinceId ? (citiesQuery.data ?? []) : [];
  const districtsFromQuery: OrgDistrict[] =
    tab === 'schools' && provinceId ? (districtsQuery.data ?? []) : [];
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

  return {
    provinces,
    cities,
    districtsFromQuery,
    roles,
    provinceHasNoCities,
  };
}
