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
import { DEFAULT_PAGE_LIMIT } from '@/utils/offset-limit-page';


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

/** Nest Province → OrgProvince */
function toOrgProvince(p: { id: string; title: string }): OrgProvince {
  return { id: p.id, name: p.title };
}

/** Nest City → OrgCity */
function toOrgCity(c: {
  id: string;
  title: string;
  province_id: string;
}): OrgCity {
  return { id: c.id, name: c.title, provinceId: c.province_id };
}

/** Nest EducationalDistrict/School → OrgDistrict */
function toOrgDistrict(d: {
  id: string;
  title: string;
  provinceId?: string;
  cityId?: string;
}): OrgDistrict {
  return {
    id: d.id,
    name: d.title,
    provinceId: d.provinceId ?? '',
    cityId: d.cityId ?? '',
  };
}

/** Nest School → OrgSchool */
function toOrgSchool(s: {
  id: string;
  title: string;
  provinceId?: string;
  cityId?: string;
  educationId?: string;
  gender?: string;
}): OrgSchool {
  const gender =
    s.gender?.toLowerCase() === 'girl' || s.gender?.toLowerCase() === 'female'
      ? 'female'
      : 'male';
  return {
    id: s.id,
    name: s.title,
    provinceId: s.provinceId ?? '',
    cityId: s.cityId ?? '',
    districtId: s.educationId ?? '',
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
        adminCatalogApi.getAllProvinces().then((ps) => ps.map(toOrgProvince)),
        adminCatalogApi.listCities().then((cs) => cs.map(toOrgCity)),
        adminCatalogApi.listEducations().then((ds) =>
          Array.isArray(ds)
            ? (ds as { id: string; title: string; provinceId?: string; cityId?: string }[]).map(toOrgDistrict)
            : []
        ),
        adminCatalogApi.listSchools().then((ss) =>
          Array.isArray(ss)
            ? (ss as { id: string; title: string; provinceId?: string; cityId?: string; educationId?: string; gender?: string }[]).map(toOrgSchool)
            : []
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

      type RawItem = { id: string; title: string; provinceId?: string; cityId?: string; educationId?: string; gender?: string; province_id?: string };

      let items: OrgStructureListItem[] = [];

      if (options.tab === 'provinces') {
        const raw = await adminCatalogApi.listProvinces({ page, limit }) as RawItem[];
        items = raw.map((p) => ({ ...toOrgProvince(p), kind: 'province' as const, deleteBlocked: false }));
      } else if (options.tab === 'cities') {
        const raw = await adminCatalogApi.listCities({ page, limit }) as (RawItem & { province_id: string })[];
        items = raw.map((c) => ({ ...toOrgCity(c), kind: 'city' as const, deleteBlocked: false }));
      } else if (options.tab === 'districts') {
        const raw = await adminCatalogApi.listEducations({ title: query || undefined }) as RawItem[];
        items = raw.map((d) => ({ ...toOrgDistrict(d), kind: 'district' as const, deleteBlocked: false }));
      } else if (options.tab === 'schools') {
        const raw = await adminCatalogApi.listSchools({ title: query || undefined }) as RawItem[];
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

  /** GET /org-structure/:kind/:id */
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
    requireMockOrgManage();
    return mockGetEntity(kind, id);
  },

  /** GET /org-structure/provinces — real: GET /api/admin/province/all */
  async listProvinces(): Promise<OrgProvince[]> {
    if (!IS_MOCK_MODE) {
      const raw = await adminCatalogApi.getAllProvinces();
      return raw.map(toOrgProvince);
    }
    requireMockOrgManage();
    return mockListProvinces();
  },

  /** GET /org-structure/cities?provinceId= — real: GET /api/admin/provinces/{id}/cities */
  async listCities(provinceId: string): Promise<OrgCity[]> {
    if (!IS_MOCK_MODE) {
      const raw = await adminCatalogApi.listCitiesByProvince(provinceId) as { id: string; title: string; province_id: string }[];
      return raw.map(toOrgCity);
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
      const raw = await adminCatalogApi.listEducations({ provinceId, cityId }) as { id: string; title: string; provinceId?: string; cityId?: string }[];
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
