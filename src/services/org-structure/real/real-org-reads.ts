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
  toOrgDistrict,
  toOrgFaculty,
  toOrgMajorListItem,
  toOrgMajorListItemForRole,
  toOrgProvince,
  toOrgSchool,
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
 * In-memory leftover from when some org tabs returned a bare Nest array.
 * Catalog tabs now page on Nest; mutations still flush this map so the
 * delete-blocked index does not outlive a write.
 */
type BareListCacheEntry = {
  query: string;
  items: OrgStructureListItem[];
  /** Monotonic timestamp — set to 0 by invalidation to force a fresh fetch. */
  staleSince: number;
};

const bareListCache = new Map<OrgStructureSubTab, BareListCacheEntry>();

/**
 * Called by real-org-mutations.ts after any write so the very next read
 * bypasses the cache and fetches fresh data from Nest.
 * Setting `staleSince: 0` (rather than deleting the entry) guarantees the
 * check `staleSince > 0` fails, forcing a fresh fetch, without the
 * risk of a concurrent reader finding no entry and kicking off a second
 * parallel fetch before the first one lands.
 */
export function invalidateRealBareListCache(tab?: OrgStructureSubTab): void {
  flushRealDeleteBlockedCache();
  if (tab) {
    const entry = bareListCache.get(tab);
    if (entry) {
      bareListCache.set(tab, { ...entry, staleSince: 0 });
    }
    // No entry yet — nothing to invalidate; the next read will fetch fresh.
    return;
  }
  // Invalidate all tabs.
  for (const [key, entry] of bareListCache) {
    bareListCache.set(key, { ...entry, staleSince: 0 });
  }
}

/**
 * Hard-deletes all entries from the in-memory bare-list cache.
 *
 * Use this when you need a guaranteed sync flush — e.g. immediately before
 * a `reload()` in the UI so the refetch never hits a stale entry even under
 * a race where `staleSince: 0` could theoretically still be served before
 * the new fetch lands. `invalidateRealBareListCache` is the soft variant
 * (sets staleSince=0); this is the hard variant (Map.clear).
 *
 * Called by `useOrgStructurePage.invalidateAndReload` after every mutation
 * so the delete-blocked index and leftover cache entries do not outlive
 * create/update/delete.
 */
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
    // Catalog index is advisory. Keep the list readable if a child
    // endpoint is down; Nest still rejects an illegal DELETE.
    return page;
  }
}

async function listRealPageRaw(
  options: RealListPageOptions
): Promise<OrgStructureListPage> {
  const { offset, limit, query } = options;
  const page = Math.floor(offset / limit) + 1;

  // Confirmed envelope: GET /admin/provinces and GET /admin/cities both
  // return { data, hasNextPage } — real server-side paging.
  if (options.tab === 'provinces') {
    const { data, hasNextPage } = await adminCatalogApi.listProvinces({
      page,
      limit,
      // فیلتر عنوان برای provinces — توسط toNestTitleFilterSearchParams در adminCatalogApi
      ...(query ? { filters: query } : {}),
    });
    const items: OrgStructureListItem[] = data.map((p) => ({
      ...toOrgProvince(p),
      kind: 'province' as const,
      deleteBlocked: false,
    }));
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
    const items: OrgStructureListItem[] = data.map((c) => ({
      ...toOrgCity(c),
      kind: 'city' as const,
      deleteBlocked: false,
      provinceName: firstRelationTitle(c.province, c.province_id),
    }));
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
    const items: OrgStructureListItem[] = data.map((d) => {
      const mapped = toOrgDistrict(d);
      return overlayOrgRelationLabels({
        ...mapped,
        kind: 'district' as const,
        deleteBlocked: false,
        provinceName: firstRelationTitle(d.province, d.provinceId, d.province_id),
        cityName: firstRelationTitle(d.city, d.cityId, d.city_id),
      });
    });
    return {
      items,
      total: estimateHasNextPageTotal(offset, items.length, hasNextPage),
      hasMore: hasNextPage,
    };
  }

  if (options.tab === 'schools') {
    const { data, hasNextPage } = await adminCatalogApi.listSchools({
      page,
      limit,
      title: query || undefined,
    });
    const items: OrgStructureListItem[] = data.map((s) => {
      const mapped = toOrgSchool(s);
      return overlayOrgRelationLabels({
        ...mapped,
        kind: 'school' as const,
        deleteBlocked: false,
        provinceName: firstRelationTitle(s.province, s.provinceId, s.province_id),
        cityName: firstRelationTitle(s.city, s.cityId, s.city_id),
        districtName: firstRelationTitle(
          s.education,
          s.educationId,
          s.education_id,
          s.educationalDistrict,
          s.district
        ),
      });
    });
    return {
      items,
      total: estimateHasNextPageTotal(offset, items.length, hasNextPage),
      hasMore: hasNextPage,
    };
  }

  if (options.tab === 'majors') {
    // GET /admin/degreeee — `{ data, hasNextPage }` + page/limit/title.
    // join این endpoint فقط `role.title` انگلیسی دارد؛ title_fa را از
    // GET /admin/roles تزریق می‌کنیم تا جدول فارسی بماند.
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

  // faculties: GET /admin/universites — `{ data, hasNextPage }`, title filter.
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
      // Confirmed live quirk: province is nested under `role`, not `province`.
      provinceName: firstRelationTitle(u.province, u.role, u.provinceId),
    });
  });
  return {
    items,
    total: estimateHasNextPageTotal(offset, items.length, hasNextPage),
    hasMore: hasNextPage,
  };
}

/**
 * GET /org-structure/:kind/:id — city uses GET /admin/cities/{id}.
 * Province/faculty still scan the full catalog (no get-by-id on Nest).
 */
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

/** GET /org-structure/provinces — real: GET /api/admin/province/all (falls back to paging). */
export async function listRealProvinces(): Promise<OrgProvince[]> {
  const provinces = await fetchAllNestProvinces();
  return provinces.map(toOrgProvince);
}

/** GET /org-structure/cities?provinceId= — real: GET /api/admin/provinces/{id}/cities */
export async function listRealCities(provinceId: string): Promise<OrgCity[]> {
  const raw = await adminCatalogApi.listCitiesByProvince(provinceId);
  return raw.map((c) => ({ id: c.id, name: c.title, provinceId }));
}

/** GET /org-structure/districts — real: GET /api/admin/educations?provinceId.
 *
 * Confirmed live: adding `cityId` to that query 500s the Nest handler, so
 * city filtering stays client-side after a province-only fetch.
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

/**
 * GET /admin/roles — real: roles a degree/major can link to.
 * `title_fa` is the Persian label (preferred); `title` is the English
 * role key (fallback); resolveRoleLabel() handles both.
 */
export async function listRealRoles(): Promise<OrgRole[]> {
  const roles = await adminCatalogApi.listRoles();
  return roles.map((r) => ({ id: r.id, name: resolveRoleLabel(r) }));
}

/**
 * GET /admin/roles/{roleId}/degrees — degrees scoped to one role.
 */
export async function listRealMajorsByRole(
  roleId: string
): Promise<OrgStructureListItem[]> {
  const raw = await adminCatalogApi.listDegreesByRole(roleId);
  return raw.map((d) => toOrgMajorListItemForRole(d, roleId));
}
