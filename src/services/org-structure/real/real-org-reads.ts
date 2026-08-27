import {
  adminCatalogApi,
  fetchAllNestProvinces,
} from '@/services/admin-catalog/admin-catalog.api';
import {
  resolveRoleLabel,
  toOrgCity,
  toOrgDistrict,
  toOrgFaculty,
  toOrgMajorListItem,
  toOrgMajorListItemForRole,
  toOrgProvince,
  toOrgSchool,
} from '@/services/org-structure/real/real-org-mappers';
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
import { estimateHasNextPageTotal, sliceOffsetLimitPage } from '@/utils/offset-limit-page';

export async function getRealSnapshot(): Promise<OrgStructureSnapshot> {
  const [provinces, cities, districts, schools] = await Promise.all([
    fetchAllNestProvinces().then((ps) => ps.map(toOrgProvince)),
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
 * to `limit` and reporting real total/hasMore via sliceOffsetLimitPage.
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
 * Per-tab+query in-memory cache for bare (unpaginated) list responses.
 *
 * Why this exists: districts/schools/majors/faculties have no Nest paging
 * envelope so every page must start from the full remote array. Without
 * this cache, "load more" would re-fetch and re-map the same full array
 * on every page increment.
 *
 * Invalidation: any real-mode mutation calls `invalidateRealBareListCache`
 * which sets `staleSince` to 0, making the next read treat it as expired
 * and force a fresh network fetch — regardless of TTL. This guarantees
 * that immediately after create/update/delete the list is always fresh.
 *
 * TTL (BARE_LIST_CACHE_TTL_MS) is a safety-net for forgotten invalidations,
 * not the primary freshness mechanism.
 */
const BARE_LIST_CACHE_TTL_MS = 30_000;

type BareListCacheEntry = {
  query: string;
  items: OrgStructureListItem[];
  /** Monotonic timestamp — set to 0 by invalidation to force a fresh fetch. */
  staleSince: number;
};

const bareListCache = new Map<OrgStructureSubTab, BareListCacheEntry>();

async function getBareListItems(
  tab: OrgStructureSubTab,
  query: string,
  fetcher: () => Promise<OrgStructureListItem[]>
): Promise<OrgStructureListItem[]> {
  const cached = bareListCache.get(tab);
  const isValid =
    cached !== undefined &&
    cached.query === query &&
    cached.staleSince > 0 &&
    Date.now() - cached.staleSince < BARE_LIST_CACHE_TTL_MS;

  if (isValid) return cached.items;

  const items = await fetcher();
  bareListCache.set(tab, { query, items, staleSince: Date.now() });
  return items;
}

/**
 * Called by real-org-mutations.ts after any write so the very next read
 * bypasses the cache and fetches fresh data from Nest.
 * Setting `staleSince: 0` (rather than deleting the entry) guarantees the
 * check `staleSince > 0` fails, forcing a fresh fetch, without the
 * risk of a concurrent reader finding no entry and kicking off a second
 * parallel fetch before the first one lands.
 */
export function invalidateRealBareListCache(tab?: OrgStructureSubTab): void {
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
 * so tabs that read from bareListCache (districts/schools/majors/faculties)
 * always get a fresh network fetch after create/update/delete.
 */
export function flushBareListCache(tab?: OrgStructureSubTab): void {
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
      // استان تابعه — از آبجکت nested province.title
      provinceName: c.province?.title ?? undefined,
    }));
    return {
      items,
      total: estimateHasNextPageTotal(offset, items.length, hasNextPage),
      hasMore: hasNextPage,
    };
  }

  // Everything below has no Nest paging envelope (bare array) — page it
  // client-side with sliceOffsetLimitPage and cache the full mapped array.
  if (options.tab === 'districts') {
    const items = await getBareListItems('districts', query, async () => {
      const raw = await adminCatalogApi.listEducations({
        title: query || undefined,
      });
      return raw.map((d) => ({
        ...toOrgDistrict(d),
        kind: 'district' as const,
        deleteBlocked: false,
        // استان و شهر تابعه — از آبجکت nested
        provinceName: d.province?.title ?? undefined,
        cityName: d.city?.title ?? undefined,
      }));
    });
    return pageBareList(items, offset, limit);
  }

  if (options.tab === 'schools') {
    const items = await getBareListItems('schools', query, async () => {
      // منطقه آموزشی (education) روی برخی ردیف‌های زنده Nest به‌صورت nested
      // برنمی‌گردد (شبیه کوییرک province/role در توی توی toOrgFaculty) — برای
      // همین لیست مناطق را هم موازی می‌گیریم و اگر s.education?.title خالی بود،
      // از روی districtId (educationId) نام منطقه را از این لیست پیدا می‌کنیم
      // تا ستون «منطقه آموزشی» در جدول خالی نماند.
      const [raw, educations] = await Promise.all([
        adminCatalogApi.listSchools({ title: query || undefined }),
        adminCatalogApi.listEducations(),
      ]);
      const districtNameById = new Map(
        educations.map((edu) => [edu.id, edu.title])
      );
      return raw.map((s) => {
        const mapped = toOrgSchool(s);
        return {
          ...mapped,
          kind: 'school' as const,
          deleteBlocked: false,
          // استان و شهر تابعه — از آبجکت‌های nested
          provinceName: s.province?.title ?? undefined,
          cityName: s.city?.title ?? undefined,
          districtName:
            s.education?.title ??
            (mapped.districtId
              ? districtNameById.get(mapped.districtId)
              : undefined) ??
            undefined,
        };
      });
    });
    return pageBareList(items, offset, limit);
  }

  if (options.tab === 'majors') {
    // GET /admin/degreeee — bare array, no paging envelope.
    // مشکل: Nest روی این endpoint گاهی title_fa رو روی role join برنمی‌گردونه —
    // برای اینکه جدول همیشه فارسی نشون بده، roles را parallel فچ می‌کنیم و
    // title_fa رو به هر degree.role inject می‌کنیم تا resolveRoleLabel درست
    // داده فارسی بگیره حتی وقتی API آن رو خالی برگردونه.
    const items = await getBareListItems('majors', query, async () => {
      const [raw, roles] = await Promise.all([
        adminCatalogApi.listDegrees(query || undefined),
        adminCatalogApi.listRoles(),
      ]);
      // یک Map از roleId → { title_fa, title } بساز ایجاد کن تا به O(1) دسترسی داشته باشیم.
      const roleMap = new Map(
        roles.map((r) => [r.id, { title: r.title, title_fa: r.title_fa }])
      );
      return raw.map((d) => {
        // اگر role.title_fa روی degree خالیه، از roleMap اینریچ کن.
        const enrichedRole = d.role?.id
          ? { ...d.role, ...(roleMap.get(d.role.id) ?? {}) }
          : d.role;
        return toOrgMajorListItem({ ...d, role: enrichedRole });
      });
    });
    return pageBareList(items, offset, limit);
  }

  // faculties: GET /admin/universites — bare array, title-only filter.
  const items = await getBareListItems('faculties', query, async () => {
    const raw = await adminCatalogApi.listUniversities(query || undefined);
    return raw.map((u) => ({
      ...toOrgFaculty(u),
      kind: 'faculty' as const,
      deleteBlocked: false,
      // Confirmed live quirk: province is nested under `role`, not `province`.
      // Prefer correctly-named `province` first (in case backend fixes it),
      // then fall back to the mislabeled `role` field.
      provinceName: u.province?.title ?? u.role?.title ?? undefined,
      cityName: u.city?.title ?? undefined,
    }));
  });
  return pageBareList(items, offset, limit);
}

/**
 * GET /org-structure/:kind/:id — real: province and faculty only for now.
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
    const raw = await adminCatalogApi.listUniversities();
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

/** GET /org-structure/districts — real: GET /api/admin/educations?provinceId&cityId */
export async function listRealDistricts(
  provinceId: string,
  cityId?: string
): Promise<OrgDistrict[]> {
  const raw = await adminCatalogApi.listEducations({ provinceId, cityId });
  return raw.map(toOrgDistrict);
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
