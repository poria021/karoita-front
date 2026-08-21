import { IS_MOCK_MODE } from '@/lib/api-mode';
import { delayMockAdminListPage } from '@/lib/mock-admin-list-delay';
import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import {
  cloneSnapshot,
  readOrgSnapshot,
} from '@/services/org-structure/mock-org-store';
import {
  listLabelsForField as queryLabelsForField,
  queryOrgListPage,
  type OrgStructureListItem,
  type OrgStructureListPage,
} from '@/services/org-structure/mock-org-query';
import {
  mockDeleteEntity,
  mockGetEntity,
  mockListCities,
  mockListDistricts,
  mockListProvinces,
  mockUpsertCity,
  mockUpsertDistrict,
  mockUpsertFaculty,
  mockUpsertMajor,
  mockUpsertProvince,
  mockUpsertSchool,
  type UpsertCityInput,
  type UpsertDistrictInput,
  type UpsertFacultyInput,
  type UpsertMajorInput,
  type UpsertProvinceInput,
  type UpsertSchoolInput,
} from '@/services/org-structure/mock-org-mutations';
import type {
  OrgCity,
  OrgDistrict,
  OrgFaculty,
  OrgMajor,
  OrgProvince,
  OrgSchool,
  OrgStructureEntityKind,
  OrgStructureSnapshot,
  OrgStructureSubTab,
} from '@/types/org-structure';
import type { NestProvince } from '@/types/nest-admin';
import {
  DEFAULT_PAGE_LIMIT,
  estimateHasNextPageTotal,
} from '@/utils/offset-limit-page';


export const ORG_STRUCTURE_PAGE_SIZE = DEFAULT_PAGE_LIMIT;

export type {
  OrgStructureListItem,
  OrgStructureListPage,
  UpsertCityInput,
  UpsertDistrictInput,
  UpsertFacultyInput,
  UpsertMajorInput,
  UpsertProvinceInput,
  UpsertSchoolInput,
};

export type OrgStructureListPageOptions = {
  tab: OrgStructureSubTab;
  offset?: number;
  limit?: number;
  query?: string;
};

function requireMockOrgManage(): void {
  if (!IS_MOCK_MODE) {
    // real mode — caller must handle the real API branch directly
    return;
  }
  assertMockClientHasPermission('organization.manage');
}

const REAL_PROVINCE_FETCH_PAGE_SIZE = 200;
// Guards a runaway loop if `hasNextPage` never settles to false.
const REAL_PROVINCE_FETCH_MAX_PAGES = 50;

/** Nest has no bulk "all provinces" endpoint — page through GET /admin/provinces. */
async function fetchAllRealProvinces(): Promise<NestProvince[]> {
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

/** Nest Province → OrgProvince */
function toOrgProvince(p: { id: string; title: string }): OrgProvince {
  return { id: p.id, name: p.title };
}

/** Nest City → OrgCity. Live GET responses nest `province: { id, ... }`
 * (sometimes `{}`) instead of the flat `province_id` the Swagger schema
 * doc and create/update DTOs use — try both. */
function toOrgCity(c: {
  id: string;
  title: string;
  province_id?: string;
  province?: { id?: string; title?: string } | null;
}): OrgCity {
  return {
    id: c.id,
    name: c.title,
    provinceId: c.province_id ?? c.province?.id ?? '',
  };
}

/**
 * Shared raw shape for `/admin/educations` and `/admin/schools` rows —
 * both may carry either flat `provinceId`/`cityId`/`educationId` (Swagger
 * DTO shape) or nested `province`/`city`/`education` objects (observed
 * live-response shape), so every reader here resolves defensively.
 *
 * (Was previously declared twice under two different names — once inline
 * here, once as a function-local `RawItem` inside `listPage()` — which
 * left `getSnapshot()`/`listDistricts()` referencing an undeclared
 * `RawEducationOrSchoolItem`. Hoisted to one module-level type.)
 */
type RawEducationOrSchoolItem = {
  id: string;
  title: string;
  provinceId?: string;
  cityId?: string;
  educationId?: string;
  gender?: string;
  province_id?: string;
  city_id?: string;
  education_id?: string;
  province?: { id?: string } | null;
  city?: { id?: string } | null;
  education?: { id?: string } | null;
};

/** Nest EducationalDistrict/School → OrgDistrict. Same defensive shape
 * handling as toOrgCity — not confirmed live yet, but educations/schools
 * link to province+city the same way cities link to province, so a
 * nested `province`/`city` object instead of flat `provinceId`/`cityId`
 * is equally plausible here. */
function toOrgDistrict(d: RawEducationOrSchoolItem): OrgDistrict {
  return {
    id: d.id,
    name: d.title,
    provinceId: d.provinceId ?? d.province_id ?? d.province?.id ?? '',
    cityId: d.cityId ?? d.city_id ?? d.city?.id ?? '',
  };
}

/** Nest School → OrgSchool. Same defensive shape handling as toOrgCity. */
function toOrgSchool(s: RawEducationOrSchoolItem): OrgSchool {
  const gender =
    s.gender?.toLowerCase() === 'girl' || s.gender?.toLowerCase() === 'female'
      ? 'female'
      : 'male';
  return {
    id: s.id,
    name: s.title,
    provinceId: s.provinceId ?? s.province_id ?? s.province?.id ?? '',
    cityId: s.cityId ?? s.city_id ?? s.city?.id ?? '',
    districtId: s.educationId ?? s.education_id ?? s.education?.id ?? '',
    gender,
  };
}

/**
 * Org tree admin facade — paged lists + CRUD.
 * Real mode fail-closed until Nest org endpoints land.
 *
 * Nest map:
 * - GET    /org-structure/snapshot
 * - GET    /org-structure?tab&query&offset&limit
 * - GET    /org-structure/:kind/:id
 * - GET    /org-structure/provinces|cities|districts
 * - PUT    /org-structure/provinces|cities|faculties|districts|schools|majors
 * - DELETE /org-structure/:kind/:id
 */
export const OrgStructureService = {
  /** GET /org-structure/snapshot — real: composite from provinces+cities+districts+schools */
  async getSnapshot(): Promise<OrgStructureSnapshot> {
    if (!IS_MOCK_MODE) {
      const [provinces, cities, districts, schools] = await Promise.all([
        fetchAllRealProvinces().then((ps) => ps.map(toOrgProvince)),
        adminCatalogApi.listCities().then((res) => res.data.map(toOrgCity)),
        adminCatalogApi.listEducations().then((ds) =>
          Array.isArray(ds) ? (ds as RawEducationOrSchoolItem[]).map(toOrgDistrict) : []
        ),
        adminCatalogApi.listSchools().then((ss) =>
          Array.isArray(ss) ? (ss as RawEducationOrSchoolItem[]).map(toOrgSchool) : []
        ),
      ]);
      return { provinces, cities, districts, schools, majors: [], faculties: [] };
    }
    requireMockOrgManage();
    return cloneSnapshot(readOrgSnapshot());
  },

  /** GET /org-structure?tab&query&offset&limit */
  async listPage(
    options: OrgStructureListPageOptions
  ): Promise<OrgStructureListPage> {
    if (!IS_MOCK_MODE) {
      const offset = options.offset ?? 0;
      const limit = options.limit ?? ORG_STRUCTURE_PAGE_SIZE;
      const page = Math.floor(offset / limit) + 1;
      const query = options.query ?? '';

      // Confirmed envelope: GET /admin/provinces and GET /admin/cities both
      // return { data, hasNextPage }. districts/schools still assume a bare
      // array below — verify before trusting their hasMore/total.
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

      let items: OrgStructureListItem[] = [];

      if (options.tab === 'districts') {
        const raw = (await adminCatalogApi.listEducations({
          title: query || undefined,
        })) as RawEducationOrSchoolItem[];
        items = raw.map((d) => ({ ...toOrgDistrict(d), kind: 'district' as const, deleteBlocked: false }));
      } else if (options.tab === 'schools') {
        const raw = (await adminCatalogApi.listSchools({
          title: query || undefined,
        })) as RawEducationOrSchoolItem[];
        items = raw.map((s) => ({ ...toOrgSchool(s), kind: 'school' as const, deleteBlocked: false, gender: toOrgSchool(s).gender }));
      } else {
        // majors / faculties — not in Swagger; return empty
        items = [];
      }

      return {
        items,
        total: items.length,
        hasMore: false,
      };
    }

    requireMockOrgManage();
    await delayMockAdminListPage();
    const offset = options.offset ?? 0;
    const limit = options.limit ?? ORG_STRUCTURE_PAGE_SIZE;
    const query = options.query ?? '';
    return queryOrgListPage(options.tab, query, offset, limit);
  },

  /**
   * GET /org-structure/:kind/:id — real: province only for now (Nest has no
   * get-by-id route; resolved by scanning the full province list). Other
   * kinds fall through to mock and resolve to null in real mode.
   */
  async getEntity(
    kind: OrgStructureEntityKind,
    id: string
  ): Promise<
    | OrgProvince
    | OrgCity
    | OrgFaculty
    | OrgDistrict
    | OrgSchool
    | OrgMajor
    | null
  > {
    if (!IS_MOCK_MODE) {
      if (kind === 'province') {
        const provinces = await OrgStructureService.listProvinces();
        return provinces.find((p) => p.id === id) ?? null;
      }
      return null;
    }
    requireMockOrgManage();
    return mockGetEntity(kind, id);
  },

  /** GET /org-structure/provinces — real: pages GET /api/admin/provinces to collect the full list. */
  async listProvinces(): Promise<OrgProvince[]> {
    if (!IS_MOCK_MODE) {
      const provinces = await fetchAllRealProvinces();
      return provinces.map(toOrgProvince);
    }
    requireMockOrgManage();
    return mockListProvinces();
  },

  /** GET /org-structure/cities?provinceId= — real: GET /api/admin/provinces/{id}/cities */
  async listCities(provinceId: string): Promise<OrgCity[]> {
    if (!IS_MOCK_MODE) {
      const raw = (await adminCatalogApi.listCitiesByProvince(provinceId)) as {
        id: string;
        title: string;
        province_id?: string;
        province?: { id?: string } | null;
      }[];
      // This list is already scoped to `provinceId` by the endpoint itself —
      // use the known value directly rather than trusting whichever (if
      // any) province field shape the row happens to carry.
      return raw.map((c) => ({ id: c.id, name: c.title, provinceId }));
    }
    requireMockOrgManage();
    return mockListCities(provinceId);
  },

  /** GET /org-structure/districts — real: GET /api/admin/educations?provinceId&cityId */
  async listDistricts(
    provinceId: string,
    cityId?: string
  ): Promise<OrgDistrict[]> {
    if (!IS_MOCK_MODE) {
      const raw = (await adminCatalogApi.listEducations({
        provinceId,
        cityId,
      })) as RawEducationOrSchoolItem[];
      return raw.map(toOrgDistrict);
    }
    requireMockOrgManage();
    return mockListDistricts(provinceId, cityId);
  },

  /** Sync labels for profile typeahead — mock only; real uses OrganizationOptionsService */
  listLabelsForField(
    field: 'province' | 'city' | 'college' | 'district' | 'school' | 'major',
    provinceName = '',
    districtName = ''
  ): string[] {
    if (!IS_MOCK_MODE) return [];
    return queryLabelsForField(field, provinceName, districtName);
  },

  /** PUT /org-structure/provinces — real: POST/PATCH /api/admin/provinces */
  async upsertProvince(
    input: UpsertProvinceInput,
    editId?: string
  ): Promise<void> {
    if (!IS_MOCK_MODE) {
      if (editId) {
        await adminCatalogApi.updateProvince(editId, { title: input.name });
      } else {
        await adminCatalogApi.createProvince({ title: input.name });
      }
      return;
    }
    requireMockOrgManage();
    mockUpsertProvince(input, editId);
  },

  /** PUT /org-structure/cities — real: POST/PATCH /api/admin/cities */
  async upsertCity(input: UpsertCityInput, editId?: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      if (editId) {
        await adminCatalogApi.updateCity(editId, { title: input.name });
      } else {
        await adminCatalogApi.createCity({
          title: input.name,
          province_id: input.provinceId,
        });
      }
      return;
    }
    requireMockOrgManage();
    mockUpsertCity(input, editId);
  },

  /**
   * PUT /org-structure/faculties — no direct Swagger endpoint.
   * Mapped to university CRUD as the closest entity (faculty ≈ university).
   */
  async upsertFaculty(
    input: UpsertFacultyInput,
    editId?: string
  ): Promise<void> {
    if (!IS_MOCK_MODE) {
      if (editId) {
        await adminCatalogApi.updateUniversity(editId, {
          title: input.name,
          provinceId: input.provinceId,
          cityId: input.cityId,
        });
      } else {
        await adminCatalogApi.createUniversity({
          title: input.name,
          provinceId: input.provinceId,
          cityId: input.cityId,
        });
      }
      return;
    }
    requireMockOrgManage();
    mockUpsertFaculty(input, editId);
  },

  /** PUT /org-structure/districts — real: POST/PUT /api/admin/educations */
  async upsertDistrict(
    input: UpsertDistrictInput,
    editId?: string
  ): Promise<void> {
    if (!IS_MOCK_MODE) {
      if (editId) {
        await adminCatalogApi.updateEducation(editId, {
          title: input.name,
          provinceId: input.provinceId,
          cityId: input.cityId,
        });
      } else {
        await adminCatalogApi.createEducation({
          title: input.name,
          provinceId: input.provinceId,
          cityId: input.cityId,
        });
      }
      return;
    }
    requireMockOrgManage();
    mockUpsertDistrict(input, editId);
  },

  /** PUT /org-structure/schools — real: POST/PUT /api/admin/schools */
  async upsertSchool(input: UpsertSchoolInput, editId?: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      const gender = input.gender === 'female' ? 'Girl' : 'Boy';
      if (editId) {
        await adminCatalogApi.updateSchool(editId, {
          title: input.name,
          provinceId: input.provinceId,
          cityId: input.cityId,
          educationId: input.districtId,
          gender,
        });
      } else {
        await adminCatalogApi.createSchool({
          title: input.name,
          provinceId: input.provinceId,
          cityId: input.cityId,
          educationId: input.districtId,
          gender,
        });
      }
      return;
    }
    requireMockOrgManage();
    mockUpsertSchool(input, editId);
  },

  /** PUT /org-structure/majors — no direct Swagger endpoint; degree is the closest. */
  async upsertMajor(input: UpsertMajorInput, editId?: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      if (editId) {
        await adminCatalogApi.updateDegree(editId, { title: input.name });
      } else {
        // roleId required by Nest — cannot know without role context; skip for now
        void input;
      }
      return;
    }
    requireMockOrgManage();
    mockUpsertMajor(input, editId);
  },

  /** DELETE /org-structure/:kind/:id — real: DELETE /api/admin/{kind}/{id} */
  async deleteEntity(kind: OrgStructureEntityKind, id: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      switch (kind) {
        case 'province':
          await adminCatalogApi.deleteProvince(id);
          break;
        case 'city':
          await adminCatalogApi.deleteCity(id);
          break;
        case 'district':
          await adminCatalogApi.deleteEducation(id);
          break;
        case 'school':
          await adminCatalogApi.deleteSchool(id);
          break;
        case 'faculty':
          await adminCatalogApi.deleteUniversity(id);
          break;
        case 'major':
          await adminCatalogApi.deleteDegree(id);
          break;
      }
      return;
    }
    requireMockOrgManage();
    mockDeleteEntity(kind, id);
  },
};
