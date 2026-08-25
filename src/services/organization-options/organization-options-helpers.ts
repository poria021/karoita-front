import { ApiClientError } from '@/services/api-client';
import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import { OrgStructureService } from '@/services/org-structure.service';
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
  signal?: AbortSignal;
};

function toNameList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function dedupeOptions(items: OrganizationOption[]): OrganizationOption[] {
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
    let all: Array<{ id: string; title: string }>;
    try {
      // GET /api/admin/province/all — اگر endpoint موجود است (یک round-trip)
      all = await adminCatalogApi.getAllProvinces();
    } catch {
      // fallback: paginate GET /api/admin/provinces
      all = [];
      let page = 1;
      for (let i = 0; i < 50; i++) {
        const res = await adminCatalogApi.listProvinces({ page, limit: 200 });
        all.push(...res.data);
        if (!res.hasNextPage) break;
        page++;
      }
    }
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
    const all = await adminCatalogApi.listEducations();
    districtCache = {
      byName: new Map(all.map((d) => [d.title, d.id])),
      fetchedAt: now,
    };
  }
  return districtCache.byName.get(districtName);
}

// ─── Paginator برای bare array (بدون envelope) ────────────────────────────────

function paginateBare(
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

// ─── کش نام → id برای شهرها ──────────────────────────────────────────────────

const CITY_CACHE_TTL_MS = 2 * 60 * 1_000; // ۲ دقیقه
let cityCache: NameIdCache | null = null;

async function resolveCityId(cityName: string, provinceId?: string): Promise<string | undefined> {
  const now = Date.now();
  if (!cityCache || now - cityCache.fetchedAt > CITY_CACHE_TTL_MS) {
    // اگه provinceId داریم فقط شهرهای همون استان رو بگیر
    let all: Array<{ id: string; title: string }>;
    if (provinceId) {
      all = await adminCatalogApi.listCitiesByProvince(provinceId);
    } else {
      // fallback: صفحه‌بندی کامل — فقط اگه استان نداریم
      all = [];
      let page = 1;
      for (let i = 0; i < 50; i++) {
        const res = await adminCatalogApi.listCities({ page, limit: 200 });
        all.push(...res.data);
        if (!res.hasNextPage) break;
        page++;
      }
    }
    cityCache = {
      byName: new Map(all.map((c) => [c.title, c.id])),
      fetchedAt: now,
    };
  }
  return cityCache.byName.get(cityName);
}

type ResolvedOptionsRequest = Required<
  Pick<OrganizationOptionsQuery, 'type' | 'page' | 'limit'>
> &
  Pick<OrganizationOptionsQuery, 'query' | 'province' | 'city' | 'district' | 'signal'>;

/**
 * Real-mode: مستقیم به Nest Admin API وصل می‌شود.
 * دیگر هیچ وابستگی به endpoint خیالی `/organization-options` ندارد.
 *
 * نقشهٔ فیلدها:
 *   province → GET /api/admin/provinces          (paginated envelope, filters param)
 *   city     → GET /api/admin/provinces/{id}/cities (bare, province-scoped)
 *              یا GET /api/admin/cities           (paginated fallback)
 *   district → GET /api/admin/educations          (bare, provinceId query)
 *   school   → GET /api/admin/schools             (bare, educationId + provinceId query)
 *   college  → GET /api/admin/universites         (bare, title query)
 *   major    → GET /api/admin/degreeee            (bare, title query)
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
        // اولویت: شهر → استان → بدون فیلتر
        // GET /api/admin/cities/{id}/educations  یا  /api/admin/province/{id}/educations
        const cityNames = toNameList(params.city);
        const provinceNames = toNameList(params.province);
        const q = params.query?.trim() || undefined;

        if (cityNames.length > 0) {
          // دقیق‌ترین فیلتر: مناطق داخل شهر
          const merged: OrganizationOption[] = [];
          for (const cityName of cityNames) {
            // برای resolve cityId ابتدا provinceId رو می‌گیریم اگه داریم
            let provinceId: string | undefined;
            if (provinceNames[0]) provinceId = await resolveProvinceId(provinceNames[0]);
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

        // fallback: همه مناطق
        const raw = await adminCatalogApi.listEducations({ title: q });
        return paginateBare(
          raw.map((d) => ({ id: d.id, label: d.title })),
          params.page,
          params.limit
        );
      }

      // ── مدرسه ───────────────────────────────────────────────────────────────
      case 'school': {
        // اولویت: منطقه → شهر → استان
        // GET /api/admin/schools?provinceId=&educationId=&title=
        let provinceId: string | undefined;
        let educationId: string | undefined;
        const q = params.query?.trim() || undefined;

        const provinceNames = toNameList(params.province);
        const cityNames = toNameList(params.city);
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
            const raw = await adminCatalogApi.listSchools({
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

        if (cityNames.length > 0) {
          // فیلتر شهری: مدارس داخل شهر (از طریق cityId نداریم در API — از provinceId استفاده کن)
          // چون Nest endpoint مدرسه cityId نداره، از provinceId استفاده می‌کنیم
          // و title فیلتر می‌کنیم
        }

        const raw = await adminCatalogApi.listSchools({
          provinceId,
          educationId,
          title: q,
        });
        return paginateBare(
          raw.map((s) => ({ id: s.id, label: s.title })),
          params.page,
          params.limit
        );
      }

      // ── دانشگاه / دانشکده / پردیس ────────────────────────────────────────────
      case 'college': {
        // GET /api/admin/universites — bare array، title query
        // اگه استان انتخاب شده، جستجو رو محدود کن (API title filter داره)
        const q = params.query?.trim() || undefined;
        const raw = await adminCatalogApi.listUniversities(q);
        return paginateBare(
          raw.map((u) => ({ id: u.id, label: u.title })),
          params.page,
          params.limit
        );
      }

      // ── رشته تحصیلی ─────────────────────────────────────────────────────────
      case 'major': {
        // GET /api/admin/degreeee — bare array، title query
        const raw = await adminCatalogApi.listDegrees(
          params.query?.trim() || undefined
        );
        return paginateBare(
          raw.map((d) => ({ id: d.id, label: d.title })),
          params.page,
          params.limit
        );
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
    districtStr
  );
  const filtered = filterByQuery(toOptions(labels), params.query ?? '');
  return paginateMock(filtered, params.page, params.limit);
}

/**
 * کش استان را باطل می‌کند.
 * پس از ایجاد/ویرایش/حذف استان در پنل ادمین صدا بزن تا
 * resolve‌های بعدی نام → id از Nest بخوانند.
 */
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
 * کش شهر را باطل می‌کند — هر بار استان عوض شد باید صدا بشه اگر می‌خوایید cityIdها درست باشند.
 */
export function invalidateCityNameCache(): void {
  cityCache = null;
}
