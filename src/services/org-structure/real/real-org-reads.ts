import {
  adminCatalogApi,
  fetchAllNestCities,
  fetchAllNestEducations,
  fetchAllNestProvinces,
  fetchAllNestSchools,
  fetchAllNestUniversities,
} from '@/services/admin-catalog/admin-catalog.api';
import {
  firstRelationTitle,
  nestUsersCount,
  resolveRoleLabel,
  toOrgCity,
  toOrgCityListItem,
  toOrgDistrict,
  toOrgDistrictListItem,
  toOrgFaculty,
  toOrgMajorListItem,
  toOrgMajorListItemForRole,
  toOrgProvince,
  toOrgSchool,
  toOrgSchoolListItem,
  toOrgProvinceListItem,
} from '@/services/org-structure/real/real-org-mappers';
import { isLinkedUserDeleteBlocked } from '@/services/org-structure/org-structure-delete-rules';
import {
  orgTabNeedsDeleteBlockedIndex,
  withDeleteBlocked,
} from '@/services/org-structure/org-structure-delete-rules';
import { overlayOrgRelationLabels } from '@/services/org-structure/real/org-relation-label-overlay';
import {
  flushRealDeleteBlockedCache,
  getRealDeleteBlockedSets,
} from '@/services/org-structure/real/real-org-delete-blocked';
import type { OrgStructureListItem, OrgStructureListPage } from '@/services/org-structure/mock/mock-org-query';
import type {
  OrgCity,
  OrgDistrict,
  OrgFaculty,
  OrgProvince,
  OrgRole,
  OrgSchool,
  OrgStructureEntityKind,
  OrgStructureSnapshot,
  OrgStructureSubTab,
} from '@/types/org-structure';
import { estimateHasNextPageTotal } from '@/utils/offset-limit-page';

export async function getRealSnapshot(): Promise<OrgStructureSnapshot> {
  const [provinces, cities, districts, schools, faculties] = await Promise.all([
    fetchAllNestProvinces().then((ps) => ps.map(toOrgProvince)),
    fetchAllNestCities().then((rows) => rows.map(toOrgCity)),
    fetchAllNestEducations().then((rows) => rows.map(toOrgDistrict)),
    fetchAllNestSchools().then((rows) => rows.map(toOrgSchool)),
    fetchAllNestUniversities().then((rows) => rows.map(toOrgFaculty)),
  ]);
  return { provinces, cities, districts, schools, majors: [], faculties };
}

/**
 * باقی‌ماندهٔ وقتی بعضی تب‌ها آرایهٔ خام Nest می‌دادند.
 * تب‌ها حالا page می‌شوند؛ mutation هنوز این Map را flush می‌کند تا ایندکس قفل‌حذف از write جلو نزند.
 */
type BareListCacheEntry = {
  query: string;
  items: OrgStructureListItem[];
  /** timestamp یکنواخت — 0 یعنی fetch اجباری. */
  staleSince: number;
};

const bareListCache = new Map<OrgStructureSubTab, BareListCacheEntry>();

/**
 * بعد از نوشتن صدا می‌شود؛ `staleSince: 0` تا reader هم‌زمان fetch دوم راه نیندازد.
 */
export function invalidateRealBareListCache(tab?: OrgStructureSubTab): void {
  flushRealDeleteBlockedCache();
  if (tab) {
    const entry = bareListCache.get(tab);
    if (entry) {
      bareListCache.set(tab, { ...entry, staleSince: 0 });
    }
    return;
  }
  for (const [key, entry] of bareListCache) {
    bareListCache.set(key, { ...entry, staleSince: 0 });
  }
}

/** پاک کردن سخت Map؛ قبل از reload تا race با `staleSince: 0` رخ ندهد. */
export function flushBareListCache(tab?: OrgStructureSubTab): void {
  flushRealDeleteBlockedCache();
  if (tab) {
    bareListCache.delete(tab);
    return;
  }
  bareListCache.clear();
}

export type RealListPageOptions = {
  tab: OrgStructureSubTab;
  offset: number;
  limit: number;
  query: string;
};

export async function listRealPage(
  options: RealListPageOptions
): Promise<OrgStructureListPage> {
  const page = await listRealPageRaw(options);
  if (!orgTabNeedsDeleteBlockedIndex(options.tab)) return page;
  try {
    const sets = await getRealDeleteBlockedSets();
    return { ...page, items: withDeleteBlocked(page.items, sets) };
  } catch {
    // ایندکس مشورتی است؛ اگر endpoint فرزند پایین باشد لیست بخواند — Nest هنوز DELETE غیرمجاز را رد می‌کند.
    return page;
  }
}

async function listRealPageRaw(
  options: RealListPageOptions
): Promise<OrgStructureListPage> {
  const { offset, limit, query } = options;
  const page = Math.floor(offset / limit) + 1;

  // GET /admin/provinces و /admin/cities پاکت `{ data, hasNextPage }` دارند.
  if (options.tab === 'provinces') {
    const { data, hasNextPage } = await adminCatalogApi.listProvinces({
      page,
      limit,
      ...(query ? { filters: query } : {}),
    });
    const items: OrgStructureListItem[] = data.map(toOrgProvinceListItem);
    return {
      items,
      total: estimateHasNextPageTotal(offset, items.length, hasNextPage),
      hasMore: hasNextPage,
    };
  }

  if (options.tab === 'cities') {
    const { data, hasNextPage } = await adminCatalogApi.listCities({
      page,
      limit,
      ...(query ? { filters: query } : {}),
    });
    const items: OrgStructureListItem[] = data.map(toOrgCityListItem);
    return {
      items,
      total: estimateHasNextPageTotal(offset, items.length, hasNextPage),
      hasMore: hasNextPage,
    };
  }

  if (options.tab === 'districts') {
    const { data, hasNextPage } = await adminCatalogApi.listEducations({
      page,
      limit,
      title: query || undefined,
    });
    const items: OrgStructureListItem[] = data.map((d) =>
      overlayOrgRelationLabels(toOrgDistrictListItem(d))
    );
    return {
      items,
      total: estimateHasNextPageTotal(offset, items.length, hasNextPage),
      hasMore: hasNextPage,
    };
  }

  if (options.tab === 'schools') {
    // GET /admin/schools شمارش کاربر و education پرشده دارد؛ /all معمولاً `userCount` ندارد.
    const { data, hasNextPage } = await adminCatalogApi.listSchoolsCatalog({
      page,
      limit,
      title: query || undefined,
    });
    const items: OrgStructureListItem[] = data.map((s) =>
      overlayOrgRelationLabels(toOrgSchoolListItem(s))
    );
    return {
      items,
      total: estimateHasNextPageTotal(offset, items.length, hasNextPage),
      hasMore: hasNextPage,
    };
  }

  if (options.tab === 'majors') {
    // join /admin/degreeee فقط `role.title` انگلیسی دارد؛ `title_fa` از GET /admin/roles تزریق می‌شود.
    const [{ data, hasNextPage }, roles] = await Promise.all([
      adminCatalogApi.listDegrees({
        page,
        limit,
        title: query || undefined,
      }),
      adminCatalogApi.listRoles(),
    ]);
    const roleMap = new Map(
      roles.map((r) => [r.id, { title: r.title, title_fa: r.title_fa }])
    );
    const items: OrgStructureListItem[] = data.map((d) => {
      const enrichedRole = d.role?.id
        ? { ...d.role, ...(roleMap.get(d.role.id) ?? {}) }
        : d.role;
      return toOrgMajorListItem({ ...d, role: enrichedRole });
    });
    return {
      items,
      total: estimateHasNextPageTotal(offset, items.length, hasNextPage),
      hasMore: hasNextPage,
    };
  }

  // GET /admin/universites (املای لایو) — `{ data, hasNextPage }`.
  const { data, hasNextPage } = await adminCatalogApi.listUniversities({
    page,
    limit,
    title: query || undefined,
  });
  const items: OrgStructureListItem[] = data.map((u) => {
    const mapped = toOrgFaculty(u);
    const usersCount = nestUsersCount(u);
    return overlayOrgRelationLabels({
      ...mapped,
      kind: 'faculty' as const,
      usersCount,
      deleteBlocked: isLinkedUserDeleteBlocked('faculty', usersCount),
      // رفتار لایو: استان زیر `role` است نه `province`.
      provinceName: firstRelationTitle(u.province, u.role, u.provinceId),
    });
  });
  return {
    items,
    total: estimateHasNextPageTotal(offset, items.length, hasNextPage),
    hasMore: hasNextPage,
  };
}

/** شهر از GET /admin/cities/{id}؛ استان/پردیس get-by-id ندارند و کاتالوگ را اسکن می‌کنند. */
export async function getRealEntity(
  kind: OrgStructureEntityKind,
  id: string
): Promise<
  OrgProvince | OrgCity | OrgFaculty | OrgDistrict | OrgSchool | null
> {
  if (kind === 'province') {
    const provinces = await listRealProvinces();
    return provinces.find((p) => p.id === id) ?? null;
  }
  if (kind === 'city') {
    const raw = await adminCatalogApi.getCity(id);
    return toOrgCity(raw);
  }
  if (kind === 'faculty') {
    const raw = await fetchAllNestUniversities();
    const match = raw.find((u) => u.id === id);
    return match ? toOrgFaculty(match) : null;
  }
  return null;
}

/** GET /admin/province/all با fallback به صفحه‌بندی. */
export async function listRealProvinces(): Promise<OrgProvince[]> {
  const provinces = await fetchAllNestProvinces();
  return provinces.map(toOrgProvince);
}

/** GET /admin/provinces/{id}/cities. */
export async function listRealCities(provinceId: string): Promise<OrgCity[]> {
  const raw = await adminCatalogApi.listCitiesByProvince(provinceId);
  return raw.map((c) => ({ id: c.id, name: c.title, provinceId }));
}

/**
 * GET /admin/educations?provinceId — افزودن `cityId` لایو ۵۰۰ می‌دهد؛ فیلتر شهر سمت کلاینت است.
 */
export async function listRealDistricts(
  provinceId: string,
  cityId?: string
): Promise<OrgDistrict[]> {
  const raw = await fetchAllNestEducations({ provinceId });
  const mapped = raw.map(toOrgDistrict);
  if (!cityId) return mapped;
  const forCity = mapped.filter((d) => d.cityId === cityId);
  return forCity.length > 0 ? forCity : mapped;
}

/** GET /admin/roles — `title_fa` برچسب فارسی، `title` کلید انگلیسی. */
export async function listRealRoles(): Promise<OrgRole[]> {
  const roles = await adminCatalogApi.listRoles();
  return roles.map((r) => ({ id: r.id, name: resolveRoleLabel(r) }));
}

/** GET /admin/roles/{roleId}/degrees. */
export async function listRealMajorsByRole(
  roleId: string
): Promise<OrgStructureListItem[]> {
  const raw = await adminCatalogApi.listDegreesByRole(roleId);
  return raw.map((d) => toOrgMajorListItemForRole(d, roleId));
}
