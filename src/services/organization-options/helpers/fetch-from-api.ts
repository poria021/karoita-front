import { ApiClientError } from '@/services/api-client';
import {
  adminCatalogApi,
  fetchAllNestSchools,
  fetchAllNestUniversities,
} from '@/services/admin-catalog/admin-catalog.api';
import { toOrgFaculty } from '@/services/org-structure/real/real-org-mappers';

import {
  resolveCityId,
  resolveDegreeCatalogRoleId,
  resolveDistrictId,
  resolveProvinceId,
} from './name-id-cache';
import {
  dedupeOptions,
  filterByQuery,
  paginateBare,
  toNameList,
  OrganizationOptionsServiceError,
  type OrganizationOption,
  type OrganizationOptionsResult,
  type ResolvedOptionsRequest,
} from './types';

/**
 * Typeahead حالت real — مستقیم به کاتالوگ Nest؛ مسیر خیالی `/organization-options` ندارد.
 * `universites`/`degreeee` املای لایو است؛ شهر بدون استان به GET /admin/cities برمی‌گردد.
 */
export async function fetchOrganizationOptionsFromApi(
  params: ResolvedOptionsRequest
): Promise<OrganizationOptionsResult> {
  try {
    switch (params.type) {
      case 'province': {
        // `filters` جستجوی عنوان است (JSON object-string در adminCatalogApi).
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
            const cities = q
              ? await adminCatalogApi.listCitiesByProvince(provinceId, {
                  title: q,
                })
              : await adminCatalogApi.listCitiesByProvince(provinceId);
            const filtered = q ? cities.filter((c) => c.title.includes(q)) : cities;
            merged.push(...filtered.map((c) => ({ id: c.id, label: c.title })));
          }
          if (matchedAnyProvince) {
            return paginateBare(dedupeOptions(merged), params.page, params.limit);
          }
        }
        // بدون استان: GET /admin/cities با پاکت صفحه‌بندی.
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

      case 'district': {
        const cityNames = toNameList(params.city);
        const provinceNames = toNameList(params.province);
        const q = params.query?.trim() || undefined;

        if (cityNames.length > 0) {
          const merged: OrganizationOption[] = [];
          for (const cityName of cityNames) {
            let provinceId: string | undefined;
            if (provinceNames[0]) provinceId = await resolveProvinceId(provinceNames[0]);
            // بدون provinceId کش شهر استان دیگری مصرف می‌شود.
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

      case 'school': {
        const q = params.query?.trim() || undefined;

        const provinceNames = toNameList(params.province);
        const districtNames = toNameList(params.district);

        if (districtNames.length > 0) {
          // منطقه به یک استان مشخص تعلق دارد؛ اگر provinceId استان دیگری هم پاس شود،
          // AND شدنش با educationId نتیجهٔ آن منطقه را در بک‌اند خالی می‌کند.
          const merged: OrganizationOption[] = [];
          for (const districtName of districtNames) {
            const edId = await resolveDistrictId(districtName);
            if (!edId) continue;
            const raw = await fetchAllNestSchools({ educationId: edId, title: q });
            merged.push(...raw.map((s) => ({ id: s.id, label: s.title })));
          }
          if (merged.length > 0) {
            return paginateBare(dedupeOptions(merged), params.page, params.limit);
          }
        }

        if (provinceNames.length > 0) {
          const merged: OrganizationOption[] = [];
          for (const provinceName of provinceNames) {
            const provinceId = await resolveProvinceId(provinceName);
            if (!provinceId) continue;
            const raw = await fetchAllNestSchools({ provinceId, title: q });
            merged.push(...raw.map((s) => ({ id: s.id, label: s.title })));
          }
          if (merged.length > 0) {
            return paginateBare(dedupeOptions(merged), params.page, params.limit);
          }
        }

        const { data, hasNextPage } = await adminCatalogApi.listSchools({
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

      case 'college': {
        const q = params.query?.trim() || undefined;
        const provinceNames = toNameList(params.province);

        // GET /admin/universites فیلتر provinceId/cityId ندارد؛ کل کاتالوگ را
        // می‌گیریم و سمت کلاینت با id استان populated روی هر ردیف فیلتر می‌کنیم.
        if (provinceNames.length > 0) {
          const provinceIds = new Set<string>();
          for (const name of provinceNames) {
            const id = await resolveProvinceId(name);
            if (id) provinceIds.add(id);
          }
          if (provinceIds.size > 0) {
            const all = await fetchAllNestUniversities({ title: q });
            const filtered = all
              .map(toOrgFaculty)
              .filter((u) => provinceIds.has(u.provinceId));
            return paginateBare(
              dedupeOptions(
                filtered.map((u) => ({ id: u.id, label: u.name }))
              ),
              params.page,
              params.limit
            );
          }
        }

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

      case 'major': {
        if (params.role) {
          const roleId = await resolveDegreeCatalogRoleId(params.role);
          if (!roleId) {
            return { items: [], hasMore: false, page: params.page };
          }
          // GET /admin/roles/{roleId}/degrees — آرایهٔ خام، بدون paging.
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

        // بدون نقش: کاتالوگ سراسری GET /admin/degreeee.
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
