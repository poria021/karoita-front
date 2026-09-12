import {
  adminCatalogApi,
  fetchAllNestEducations,
  fetchAllNestProvinces,
} from '@/services/admin-catalog/admin-catalog.api';
import { toDegreeCatalogRoleTitle } from '@/services/organization-options/degree-catalog-role';
import type { UserRole } from '@/types/auth';

// Nest برای فیلتر شهر/منطقه `provinceId` می‌خواهد ولی فرم نام label ذخیره می‌کند.

type NameIdCache = {
  byName: Map<string, string>;
  fetchedAt: number;
};

const PROVINCE_CACHE_TTL_MS = 5 * 60 * 1_000;
let provinceCache: NameIdCache | null = null;

export async function resolveProvinceId(provinceName: string): Promise<string | undefined> {
  const now = Date.now();
  if (!provinceCache || now - provinceCache.fetchedAt > PROVINCE_CACHE_TTL_MS) {
    const all = await fetchAllNestProvinces();
    provinceCache = {
      byName: new Map(all.map((p) => [p.title, p.id])),
      fetchedAt: now,
    };
  }
  return provinceCache.byName.get(provinceName);
}

const DISTRICT_CACHE_TTL_MS = 2 * 60 * 1_000;
let districtCache: NameIdCache | null = null;

export async function resolveDistrictId(districtName: string): Promise<string | undefined> {
  const now = Date.now();
  if (!districtCache || now - districtCache.fetchedAt > DISTRICT_CACHE_TTL_MS) {
    const all = await fetchAllNestEducations();
    districtCache = {
      byName: new Map(all.map((d) => [d.title, d.id])),
      fetchedAt: now,
    };
  }
  return districtCache.byName.get(districtName);
}

const CITY_CACHE_TTL_MS = 2 * 60 * 1_000;
// کلید `provinceId` تا عوض شدن استان کش استان قبلی را مصرف نکند.
const cityCacheByProvince = new Map<string, NameIdCache>();

export async function resolveCityId(cityName: string, provinceId?: string): Promise<string | undefined> {
  const cacheKey = provinceId ?? '';
  const now = Date.now();
  const cached = cityCacheByProvince.get(cacheKey);

  if (!cached || now - cached.fetchedAt > CITY_CACHE_TTL_MS) {
    let all: Array<{ id: string; title: string }>;
    if (provinceId) {
      all = await adminCatalogApi.listCitiesByProvince(provinceId);
    } else {
      all = [];
      let page = 1;
      for (let i = 0; i < 50; i++) {
        const res = await adminCatalogApi.listCities({ page, limit: 200 });
        all.push(...res.data);
        if (!res.hasNextPage) break;
        page++;
      }
    }
    cityCacheByProvince.set(cacheKey, {
      byName: new Map(all.map((c) => [c.title, c.id])),
      fetchedAt: now,
    });
  }

  return cityCacheByProvince.get(cacheKey)!.byName.get(cityName);
}

const DEGREE_ROLE_CACHE_TTL_MS = 5 * 60 * 1_000;

let degreeRoleIdByTitle: { byTitle: Map<string, string>; fetchedAt: number } | null =
  null;

export async function resolveDegreeCatalogRoleId(
  role: UserRole
): Promise<string | undefined> {
  const title = toDegreeCatalogRoleTitle(role);
  if (!title) return undefined;

  const now = Date.now();
  if (
    !degreeRoleIdByTitle ||
    now - degreeRoleIdByTitle.fetchedAt > DEGREE_ROLE_CACHE_TTL_MS
  ) {
    const roles = await adminCatalogApi.listRoles();
    const byTitle = new Map<string, string>();
    for (const entry of roles) {
      const key = entry.title?.trim().toLowerCase();
      if (key && entry.id) byTitle.set(key, entry.id);
    }
    degreeRoleIdByTitle = { byTitle, fetchedAt: now };
  }

  return degreeRoleIdByTitle.byTitle.get(title.toLowerCase());
}

/** کش نقش کاتالوگ رشته (`GET /admin/roles`) را باطل می‌کند. */
export function invalidateDegreeRoleCache(): void {
  degreeRoleIdByTitle = null;
}

/** کش نام→id استان را باطل کن تا resolve بعدی از Nest بخواند. */
export function invalidateProvinceNameCache(): void {
  provinceCache = null;
}

/** کش نام→id منطقه را باطل کن؛ بعد از CRUD منطقه. */
export function invalidateDistrictNameCache(): void {
  districtCache = null;
}

/** کل Map شهر را پاک کن — نه فقط یک استان — تا استان عوض‌شده کش کهنه نماند. */
export function invalidateCityNameCache(): void {
  cityCacheByProvince.clear();
}
