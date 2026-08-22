import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import {
  resolveRoleLabel,
  toOrgCity,
  toOrgDistrict,
  toOrgFaculty,
  toOrgMajorListItem,
  toOrgMajorListItemForRole,
  toOrgProvince,
  toOrgSchool,
} from '@/services/org-structure/real-org-mappers';
import type { OrgStructureListItem, OrgStructureListPage } from '@/services/org-structure/mock-org-query';
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
import type { NestProvince } from '@/types/nest-admin';
import { estimateHasNextPageTotal, sliceOffsetLimitPage } from '@/utils/offset-limit-page';

const REAL_PROVINCE_FETCH_PAGE_SIZE = 200;
// Guards a runaway loop if `hasNextPage` never settles to false.
const REAL_PROVINCE_FETCH_MAX_PAGES = 50;

/** Nest has no bulk "all provinces" endpoint — page through GET /admin/provinces. */
export async function fetchAllRealProvinces(): Promise<NestProvince[]> {
  const all: NestProvince[] = [];
  let page = 1;
  for (let i = 0; i < REAL_PROVINCE_FETCH_MAX_PAGES; i += 1) {
    const { data, hasNextPage } = await adminCatalogApi.listProvinces({
      page,
      limit: REAL_PROVINCE_FETCH_PAGE_SIZE,
    });
    all.push(...data);
    if (!hasNextPage) break;
    page += 1;
  }
  return all;
}

export async function getRealSnapshot(): Promise<OrgStructureSnapshot> {
  const [provinces, cities, districts, schools] = await Promise.all([
    fetchAllRealProvinces().then((ps) => ps.map(toOrgProvince)),
    adminCatalogApi.listCities().then((res) => res.data.map(toOrgCity)),
    adminCatalogApi.listEducations().then((rows) => rows.map(toOrgDistrict)),
    adminCatalogApi.listSchools().then((rows) => rows.map(toOrgSchool)),
  ]);
  return { provinces, cities, districts, schools, majors: [], faculties: [] };
}

/**
 * Client-side page a bare (unpaginated) Nest array — used for the
 * districts/schools/majors/faculties tabs, none of which have a Nest
 * paging envelope. Fixes the previous bug where these tabs always
 * returned `hasMore: false` (the entire result set rendered in one go
 * and "load more" never fired, no matter how large the list) by slicing
 * to `limit` and reporting real total/hasMore via sliceOffsetLimitPage
 * (see 82-frontend-performance.mdc — LISTS 2).
 */
function pageBareList(
  items: OrgStructureListItem[],
  offset: number,
  limit: number
): OrgStructureListPage {
  const { items: pageItems, total, hasMore } = sliceOffsetLimitPage(
    items,
    offset,
    limit
  );
  return { items: pageItems, total, hasMore };
}

/**
 * districts/schools/majors/faculties have no Nest paging envelope, so
 * every page still has to start from the full remote array — but without
 * caching, scrolling through "load more" would re-fetch and re-map that
 * full array from the network on every single page. This short-lived,
 * per-tab+query cache means only the *first* page of a given tab/query
 * pays the network round trip; subsequent pages (and the total/hasMore
 * bookkeeping) come from the same in-memory array.
 *
 * Invalidated on any real-mode org-structure mutation via
 * `invalidateRealBareListCache()` (see real-org-mutations.ts) so a
 * create/update/delete is reflected on the very next list read, and
 * expires on its own after `BARE_LIST_CACHE_TTL_MS` as a safety net.
 */
const BARE_LIST_CACHE_TTL_MS = 30_000;

type BareListCacheEntry = {
  query: string;
  items: OrgStructureListItem[];
  fetchedAt: number;
};

const bareListCache = new Map<OrgStructureSubTab, BareListCacheEntry>();

async function getBareListItems(
  tab: OrgStructureSubTab,
  query: string,
  fetcher: () => Promise<OrgStructureListItem[]>
): Promise<OrgStructureListItem[]> {
  const cached = bareListCache.get(tab);
  if (
    cached &&
    cached.query === query &&
    Date.now() - cached.fetchedAt < BARE_LIST_CACHE_TTL_MS
  ) {
    return cached.items;
  }
  const items = await fetcher();
  bareListCache.set(tab, { query, items, fetchedAt: Date.now() });
  return items;
}

/** Called by real-org-mutations.ts after any write so the next read is fresh. */
export function invalidateRealBareListCache(tab?: OrgStructureSubTab): void {
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
  const { offset, limit, query } = options;
  const page = Math.floor(offset / limit) + 1;

  // Confirmed envelope: GET /admin/provinces and GET /admin/cities both
  // return { data, hasNextPage } — real server-side paging.
  if (options.tab === 'provinces') {
    const { data, hasNextPage } = await adminCatalogApi.listProvinces({
      page,
      limit,
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
    });
    const items: OrgStructureListItem[] = data.map((c) => ({
      ...toOrgCity(c),
      kind: 'city' as const,
      deleteBlocked: false,
      provinceName: c.province?.title,
    }));
    return {
      items,
      total: estimateHasNextPageTotal(offset, items.length, hasNextPage),
      hasMore: hasNextPage,
    };
  }

  // Everything below has no Nest paging envelope (bare array) — page it
  // client-side with sliceOffsetLimitPage instead of returning it whole,
  // and cache the full mapped array per tab+query (see getBareListItems).
  if (options.tab === 'districts') {
    const items = await getBareListItems('districts', query, async () => {
      const raw = await adminCatalogApi.listEducations({
        title: query || undefined,
      });
      return raw.map((d) => ({
        ...toOrgDistrict(d),
        kind: 'district' as const,
        deleteBlocked: false,
      }));
    });
    return pageBareList(items, offset, limit);
  }

  if (options.tab === 'schools') {
    const items = await getBareListItems('schools', query, async () => {
      const raw = await adminCatalogApi.listSchools({
        title: query || undefined,
      });
      return raw.map((s) => ({
        ...toOrgSchool(s),
        kind: 'school' as const,
        deleteBlocked: false,
      }));
    });
    return pageBareList(items, offset, limit);
  }

  if (options.tab === 'majors') {
    // GET /admin/degreeee — bare array, no paging envelope.
    const items = await getBareListItems('majors', query, async () => {
      const raw = await adminCatalogApi.listDegrees(query || undefined);
      return raw.map(toOrgMajorListItem);
    });
    return pageBareList(items, offset, limit);
  }

  // faculties
  // GET /admin/universites — bare array, title-only filter, no paging envelope.
  const items = await getBareListItems('faculties', query, async () => {
    const raw = await adminCatalogApi.listUniversities(query || undefined);
    return raw.map((u) => ({
      ...toOrgFaculty(u),
      kind: 'faculty' as const,
      deleteBlocked: false,
      provinceName: u.province?.title,
      cityName: u.city?.title,
    }));
  });
  return pageBareList(items, offset, limit);
}

/**
 * GET /org-structure/:kind/:id — real: province and faculty only for now
 * (Nest has no get-by-id route for either — resolved by scanning the full
 * list instead). Other kinds return null and fall through to the caller's
 * mock branch (never hit in real mode — see org-structure.service.ts).
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
  if (kind === 'faculty') {
    // No GET /admin/universites/{id} route documented — scan the bare
    // list instead, same approach as the province branch above.
    const raw = await adminCatalogApi.listUniversities();
    const match = raw.find((u) => u.id === id);
    return match ? toOrgFaculty(match) : null;
  }
  return null;
}

/** GET /org-structure/provinces — real: pages GET /api/admin/provinces to collect the full list. */
export async function listRealProvinces(): Promise<OrgProvince[]> {
  const provinces = await fetchAllRealProvinces();
  return provinces.map(toOrgProvince);
}

/** GET /org-structure/cities?provinceId= — real: GET /api/admin/provinces/{id}/cities */
export async function listRealCities(provinceId: string): Promise<OrgCity[]> {
  const raw = await adminCatalogApi.listCitiesByProvince(provinceId);
  // This list is already scoped to `provinceId` by the endpoint itself —
  // use the known value directly rather than trusting whichever (if
  // any) province field shape the row happens to carry.
  return raw.map((c) => ({ id: c.id, name: c.title, provinceId }));
}

/** GET /org-structure/districts — real: GET /api/admin/educations?provinceId&cityId */
export async function listRealDistricts(
  provinceId: string,
  cityId?: string
): Promise<OrgDistrict[]> {
  const raw = await adminCatalogApi.listEducations({ provinceId, cityId });
  return raw.map(toOrgDistrict);
}

/**
 * GET /admin/roles — real: roles a degree/major can link to. Live rows
 * carry only `{ id }`, no display name — resolveRoleLabel() falls back
 * to a short id label so the select never shows a blank option.
 */
export async function listRealRoles(): Promise<OrgRole[]> {
  const roles = await adminCatalogApi.listRoles();
  return roles.map((r) => ({ id: r.id, name: resolveRoleLabel(r) }));
}

/**
 * GET /admin/roles/{roleId}/degrees — real: majors already linked to one
 * role. Not wired into the majors-tab list yet (that tab lists across all
 * roles via GET /admin/degreeee, see listRealPage() above) — exposed here
 * for role-scoped lookups (e.g. a future duplicate-role check in the
 * create form, or a role-filtered picker elsewhere).
 */
export async function listRealMajorsByRole(
  roleId: string
): Promise<OrgStructureListItem[]> {
  const raw = await adminCatalogApi.listDegreesByRole(roleId);
  return raw.map((d) => toOrgMajorListItemForRole(d, roleId));
}
