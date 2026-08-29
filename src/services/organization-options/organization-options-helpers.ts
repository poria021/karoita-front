import { ApiClientError } from '@/services/api-client';
import {
  adminCatalogApi,
  fetchAllNestEducations,
  fetchAllNestProvinces,
  fetchAllNestSchools,
} from '@/services/admin-catalog/admin-catalog.api';
import {
  toDegreeCatalogRoleTitle,
  toMockMajorAudience,
} from '@/services/organization-options/degree-catalog-role';
import { OrgStructureService } from '@/services/org-structure.service';
import type { UserRole } from '@/types/auth';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

export const ORGANIZATION_OPTIONS_DEFAULT_LIMIT = 10;
const MOCK_DELAY_MS = 220;

export type OrganizationOption = {
  id: string;
  label: string;
};

export type OrganizationOptionsResult = {
  items: OrganizationOption[];
  hasMore: boolean;
  page: number;
};

export type OrganizationOptionsQuery = {
  type: OrganizationField;
  query?: string;
  page?: number;
  limit?: number;
  /**
   * نام استان(های) انتخاب‌شده — برای scope کردن شهرها، مناطق، مدارس و دانشگاه‌ها.
   */
  province?: string | string[];
  /**
   * نام شهر(های) انتخاب‌شده — برای scope کردن منطقه و مدارس بر اساس شهر.
   */
  city?: string | string[];
  /**
   * نام منطقه(های) آموزشی انتخاب‌شده — برای scope کردن مدارس.
   */
  district?: string | string[];
  /**
   * نقش کاربر — برای رشته تحصیلی: GET /admin/roles/{roleId}/degrees
   * به‌جای لیست سراسری GET /admin/degreeee.
   */
  role?: UserRole;
  signal?: AbortSignal;
};

export function toNameList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

export function dedupeOptions(items: OrganizationOption[]): OrganizationOption[] {
  const seen = new Set<string>();
  const merged: OrganizationOption[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }
  return merged;
}

export class OrganizationOptionsServiceError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'OrganizationOptionsServiceError';
  }
}

// ─── کش نام → id برای استان‌ها ────────────────────────────────────────────────
// چون Nest برای فیلتر شهر/منطقه به provinceId نیاز دارد ولی فرم
// نام label ذخیره می‌کند، این resolve یک‌بار در session انجام می‌شود.

type NameIdCache = {
  byName: Map<string, string>;
  fetchedAt: number;
};

const PROVINCE_CACHE_TTL_MS = 5 * 60 * 1_000; // ۵ دقیقه
let provinceCache: NameIdCache | null = null;

async function resolveProvinceId(provinceName: string): Promise<string | undefined> {
  const now = Date.now();
  if (!provinceCache || now - provinceCache.fetchedAt > PROVINCE_CACHE_TTL_MS) {
    // GET /api/admin/province/all با fallback به pagination یکجا نگه داشته می‌شود —
    // ببین fetchAllNestProvinces() در admin-catalog.api.ts
    const all = await fetchAllNestProvinces();
    provinceCache = {
      byName: new Map(all.map((p) => [p.title, p.id])),
      fetchedAt: now,
    };
  }
  return provinceCache.byName.get(provinceName);
}

// ─── کش نام → id برای مناطق آموزشی ───────────────────────────────────────────

const DISTRICT_CACHE_TTL_MS = 2 * 60 * 1_000; // ۲ دقیقه
let districtCache: NameIdCache | null = null;

async function resolveDistrictId(districtName: string): Promise<string | undefined> {
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

// ─── Paginator برای bare array (بدون envelope) ────────────────────────────────

export function paginateBare(
  items: OrganizationOption[],
  page: number,
  limit: number
): OrganizationOptionsResult {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const start = (safePage - 1) * safeLimit;
  const slice = items.slice(start, start + safeLimit);
  return {
    items: slice,
    hasMore: start + slice.length < items.length,
    page: safePage,
  };
}

// ─── کش نام → id برای شهرها (province-scoped) ────────────────────────────────
//
// FIX: به‌جای یک singleton global، یک Map از provinceId → NameIdCache داریم.
// این باعث می‌شه وقتی استان عوض می‌شه، کش استان قدیم استفاده نشه.

const CITY_CACHE_TTL_MS = 2 * 60 * 1_000; // ۲ دقیقه

// key: provinceId (string) یا '' برای حالت بدون استان
const cityCacheByProvince = new Map<string, NameIdCache>();

async function resolveCityId(cityName: string, provinceId?: string): Promise<string | undefined> {
  const cacheKey = provinceId ?? '';
  const now = Date.now();
  const cached = cityCacheByProvince.get(cacheKey);

  if (!cached || now - cached.fetchedAt > CITY_CACHE_TTL_MS) {
    let all: Array<{ id: string; title: string }>;
    if (provinceId) {
      // دقیق‌ترین: شهرهای همان استان
      all = await adminCatalogApi.listCitiesByProvince(provinceId);
    } else {
      // fallback: همه شهرها با pagination
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

type ResolvedOptionsRequest = Required<
  Pick<OrganizationOptionsQuery, 'type' | 'page' | 'limit'>
> &
  Pick<
    OrganizationOptionsQuery,
    'query' | 'province' | 'city' | 'district' | 'role' | 'signal'
  >;

const DEGREE_ROLE_CACHE_TTL_MS = 5 * 60 * 1_000;

let degreeRoleIdByTitle: { byTitle: Map<string, string>; fetchedAt: number } | null =
  null;

async function resolveDegreeCatalogRoleId(
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

/**
 * Real-mode: مستقیم به Nest Admin API وصل می‌شود.
 * دیگر هیچ وابستگی به endpoint خیالی `/organization-options` ندارد.
 *
 * نقشهٔ فیلدها:
 *   province → GET /api/admin/provinces          (paginated envelope, filters param)
 *   city     → GET /api/admin/provinces/{id}/cities (bare, province-scoped)
 *              یا GET /api/admin/cities           (paginated fallback)
 *   district → GET /api/admin/educations          (paginated, title/provinceId/cityId)
 *   school   → GET /api/admin/schools/all         (paginated, educationId + provinceId)
 *   college  → GET /api/admin/universites         (paginated, title)
 *   major    → GET /api/admin/roles/{roleId}/degrees وقتی role هست
 *              وگرنه GET /api/admin/degreeee (paginated, title)
 */
export async function fetchOrganizationOptionsFromApi(
  params: ResolvedOptionsRequest
): Promise<OrganizationOptionsResult> {
  try {
    switch (params.type) {

      // ── استان ──────────────────────────────────────────────────────────────
      case 'province': {
        // GET /api/admin/provinces — دارای pagination envelope
        // `filters` پارامتر جستجوی عنوان است (مطابق OpenAPI)
        const { data, hasNextPage } = await adminCatalogApi.listProvinces({
          page: params.page,
          limit: params.limit,
          filters: params.query?.trim() || undefined,
        });
        return {
          items: data.map((p) => ({ id: p.id, label: p.title })),
          hasMore: hasNextPage,
          page: params.page,
        };
      }

      // ── شهر ────────────────────────────────────────────────────────────────
      case 'city': {
        const provinceNames = toNameList(params.province);
        if (provinceNames.length > 0) {
          const q = params.query?.trim();
          const merged: OrganizationOption[] = [];
          let matchedAnyProvince = false;
          for (const provinceName of provinceNames) {
            const provinceId = await resolveProvinceId(provinceName);
            if (!provinceId) continue;
            matchedAnyProvince = true;
            const cities = await adminCatalogApi.listCitiesByProvince(provinceId);
            const filtered = q ? cities.filter((c) => c.title.includes(q)) : cities;
            merged.push(...filtered.map((c) => ({ id: c.id, label: c.title })));
          }
          if (matchedAnyProvince) {
            return paginateBare(dedupeOptions(merged), params.page, params.limit);
          }
        }
        // Fallback: GET /api/admin/cities (paginated envelope)
        const { data, hasNextPage } = await adminCatalogApi.listCities({
          page: params.page,
          limit: params.limit,
          filters: params.query?.trim() || undefined,
        });
        return {
          items: data.map((c) => ({ id: c.id, label: c.title })),
          hasMore: hasNextPage,
          page: params.page,
        };
      }

      // ── منطقه آموزشی ────────────────────────────────────────────────────────
      case 'district': {
        // FIX: city رو از params می‌گیریم (قبلاً params.city گم شده بود)
        // اولویت: شهر → استان → بدون فیلتر
        const cityNames = toNameList(params.city);
        const provinceNames = toNameList(params.province);
        const q = params.query?.trim() || undefined;

        if (cityNames.length > 0) {
          // دقیق‌ترین فیلتر: مناطق داخل شهر
          const merged: OrganizationOption[] = [];
          for (const cityName of cityNames) {
            let provinceId: string | undefined;
            if (provinceNames[0]) provinceId = await resolveProvinceId(provinceNames[0]);
            // FIX: provinceId رو به resolveCityId پاس می‌دیم تا از cache درست استفاده کنه
            const cityId = await resolveCityId(cityName, provinceId);
            if (!cityId) continue;
            const raw = await adminCatalogApi.listEducationsByCity(cityId);
            const filtered = q ? raw.filter((d) => d.title.includes(q)) : raw;
            merged.push(...filtered.map((d) => ({ id: d.id, label: d.title })));
          }
          if (merged.length > 0) {
            return paginateBare(dedupeOptions(merged), params.page, params.limit);
          }
        }

        if (provinceNames.length > 0) {
          // فیلتر استانی: مناطق داخل استان
          const merged: OrganizationOption[] = [];
          for (const provinceName of provinceNames) {
            const provinceId = await resolveProvinceId(provinceName);
            if (!provinceId) continue;
            const raw = await adminCatalogApi.listEducationsByProvince(provinceId);
            const filtered = q ? raw.filter((d) => d.title.includes(q)) : raw;
            merged.push(...filtered.map((d) => ({ id: d.id, label: d.title })));
          }
          if (merged.length > 0) {
            return paginateBare(dedupeOptions(merged), params.page, params.limit);
          }
        }

        const { data, hasNextPage } = await adminCatalogApi.listEducations({
          title: q,
          page: params.page,
          limit: params.limit,
        });
        return {
          items: data.map((d) => ({ id: d.id, label: d.title })),
          hasMore: hasNextPage,
          page: params.page,
        };
      }

      // ── مدرسه ───────────────────────────────────────────────────────────────
      case 'school': {
        // اولویت: منطقه → شهر → استان
        // GET /api/admin/schools/all?provinceId=&educationId=&title=&page=&limit=
        let provinceId: string | undefined;
        let educationId: string | undefined;
        const q = params.query?.trim() || undefined;

        const provinceNames = toNameList(params.province);
        const districtNames = toNameList(params.district);

        if (provinceNames[0]) {
          provinceId = await resolveProvinceId(provinceNames[0]);
        }

        if (districtNames.length > 0) {
          // دقیق‌ترین فیلتر: منطقه آموزشی
          const merged: OrganizationOption[] = [];
          for (const districtName of districtNames) {
            const edId = await resolveDistrictId(districtName);
            if (!edId) continue;
            const raw = await fetchAllNestSchools({
              provinceId,
              educationId: edId,
              title: q,
            });
            merged.push(...raw.map((s) => ({ id: s.id, label: s.title })));
          }
          if (merged.length > 0) {
            return paginateBare(dedupeOptions(merged), params.page, params.limit);
          }
        }

        // fallback: فیلتر استانی (یا بدون فیلتر)
        const { data, hasNextPage } = await adminCatalogApi.listSchools({
          provinceId,
          educationId,
          title: q,
          page: params.page,
          limit: params.limit,
        });
        return {
          items: data.map((s) => ({ id: s.id, label: s.title })),
          hasMore: hasNextPage,
          page: params.page,
        };
      }

      // ── دانشگاه / دانشکده / پردیس ────────────────────────────────────────────
      case 'college': {
        const q = params.query?.trim() || undefined;
        const { data, hasNextPage } = await adminCatalogApi.listUniversities({
          title: q,
          page: params.page,
          limit: params.limit,
        });
        return {
          items: data.map((u) => ({ id: u.id, label: u.title })),
          hasMore: hasNextPage,
          page: params.page,
        };
      }

      // ── رشته تحصیلی ─────────────────────────────────────────────────────────
      case 'major': {
        if (params.role) {
          const roleId = await resolveDegreeCatalogRoleId(params.role);
          if (!roleId) {
            return { items: [], hasMore: false, page: params.page };
          }
          // GET /api/admin/roles/{roleId}/degrees — آرایهٔ خام، بدون paging
          const raw = await adminCatalogApi.listDegreesByRole(roleId);
          return paginateBare(
            filterByQuery(
              raw.map((d) => ({ id: d.id, label: d.title })),
              params.query ?? ''
            ),
            params.page,
            params.limit
          );
        }

        // بدون نقش: کاتالوگ سراسری (ادمین / resolve بدون scope)
        const q = params.query?.trim() || undefined;
        const { data, hasNextPage } = await adminCatalogApi.listDegrees({
          title: q,
          page: params.page,
          limit: params.limit,
        });
        return {
          items: data.map((d) => ({ id: d.id, label: d.title })),
          hasMore: hasNextPage,
          page: params.page,
        };
      }

      default:
        return { items: [], hasMore: false, page: params.page };
    }
  } catch (error) {
    if (error instanceof OrganizationOptionsServiceError) throw error;
    if (error instanceof ApiClientError) {
      throw new OrganizationOptionsServiceError(
        error.message || 'دریافت گزینه‌های سازمانی ناموفق بود.',
        error.status
      );
    }
    throw error;
  }
}

// ─── Mock mode ─────────────────────────────────────────────────────────────────

function toOptions(labels: string[]): OrganizationOption[] {
  return labels.map((label) => ({ id: label, label }));
}

function filterByQuery(items: OrganizationOption[], query: string): OrganizationOption[] {
  const normalized = query.trim();
  if (!normalized) return items;
  return items.filter((item) => item.label.includes(normalized));
}

function paginateMock(
  items: OrganizationOption[],
  page: number,
  limit: number
): OrganizationOptionsResult {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const start = (safePage - 1) * safeLimit;
  const slice = items.slice(start, start + safeLimit);
  return {
    items: slice,
    hasMore: start + slice.length < items.length,
    page: safePage,
  };
}

export async function fetchOrganizationOptionsFromMock(
  params: ResolvedOptionsRequest
): Promise<OrganizationOptionsResult> {
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, MOCK_DELAY_MS);
    params.signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });

  const provinceStr = Array.isArray(params.province) ? (params.province[0] ?? '') : (params.province ?? '');
  const districtStr = Array.isArray(params.district) ? (params.district[0] ?? '') : (params.district ?? '');
  const labels = OrgStructureService.listLabelsForField(
    params.type,
    provinceStr,
    districtStr,
    params.type === 'major' && params.role
      ? toMockMajorAudience(params.role)
      : undefined
  );
  const filtered = filterByQuery(toOptions(labels), params.query ?? '');
  return paginateMock(filtered, params.page, params.limit);
}

/**
 * کش استان را باطل می‌کند.
 * پس از ایجاد/ویرایش/حذف استان در پنل ادمین صدا بزن تا
 * resolve‌های بعدی نام → id از Nest بخوانند.
 */
export function invalidateDegreeRoleCache(): void {
  degreeRoleIdByTitle = null;
}

export function invalidateProvinceNameCache(): void {
  provinceCache = null;
}

/**
 * کش منطقه آموزشی را باطل می‌کند.
 * پس از ایجاد/ویرایش/حذف منطقه در پنل ادمین صدا بزن.
 */
export function invalidateDistrictNameCache(): void {
  districtCache = null;
}

/**
 * کش شهر را باطل می‌کند — هر بار که استان‌های انتخاب‌شده عوض شدند صدا بزن،
 * یا پس از ایجاد/ویرایش/حذف شهر در پنل ادمین.
 * FIX: حالا کل Map پاک می‌شود (نه فقط یک province-bucket) تا استال‌ترین
 * حالت هم به‌درستی expire شود.
 */
export function invalidateCityNameCache(): void {
  cityCacheByProvince.clear();
}
