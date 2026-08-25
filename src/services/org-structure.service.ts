import { IS_MOCK_MODE } from '@/lib/api-mode';
import { delayMockAdminListPage } from '@/lib/mock-admin-list-delay';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import {
  cloneSnapshot,
  readOrgSnapshot,
} from '@/services/org-structure/mock/mock-org-store';
import {
  listLabelsForField as queryLabelsForField,
  queryOrgListPage,
  type OrgStructureListItem,
  type OrgStructureListPage,
} from '@/services/org-structure/mock/mock-org-query';
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
} from '@/services/org-structure/mock/mock-org-mutations';
import {
  deleteRealEntity,
  upsertRealCity,
  upsertRealDistrict,
  upsertRealFaculty,
  upsertRealMajor,
  upsertRealProvince,
  upsertRealSchool,
} from '@/services/org-structure/real/real-org-mutations';
import {
  getRealEntity,
  getRealSnapshot,
  listRealCities,
  listRealDistricts,
  listRealMajorsByRole,
  listRealPage,
  listRealProvinces,
  listRealRoles,
} from '@/services/org-structure/real/real-org-reads';
import type {
  OrgCity,
  OrgDistrict,
  OrgFaculty,
  OrgMajor,
  OrgProvince,
  OrgRole,
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

/**
 * Org tree admin facade — paged lists + CRUD.
 * Real mode fail-closed until Nest org endpoints land.
 *
 * This is a thin dispatcher: every mock-mode call goes to `mock-org-*`
 * (services/org-structure/mock-org-query.ts, mock-org-mutations.ts,
 * mock-org-store.ts) and every real-mode call goes to `real-org-*`
 * (services/org-structure/real-org-reads.ts, real-org-mutations.ts,
 * real-org-mappers.ts) — mirroring each other file-for-file so the real
 * side gets the same "one file, one responsibility" treatment the mock
 * side already had. Nothing beyond IS_MOCK_MODE branching + the mock
 * permission guard lives in this file.
 *
 * Nest map:
 * - GET    /org-structure/snapshot
 * - GET    /org-structure?tab&query&offset&limit
 *          majors tab → GET /admin/degreeee?title= (bare array, no paging)
 *          faculties tab → GET /admin/universites?title= (bare array, no paging)
 * - GET    /org-structure/:kind/:id
 * - GET    /org-structure/provinces|cities|districts
 * - PUT    /org-structure/provinces|cities|faculties|districts|schools|majors
 * - DELETE /org-structure/:kind/:id
 */
export const OrgStructureService = {
  /** GET /org-structure/snapshot — real: composite from provinces+cities+districts+schools */
  async getSnapshot(): Promise<OrgStructureSnapshot> {
    if (!IS_MOCK_MODE) {
      return getRealSnapshot();
    }
    requireMockOrgManage();
    return cloneSnapshot(readOrgSnapshot());
  },

  /** GET /org-structure?tab&query&offset&limit */
  async listPage(
    options: OrgStructureListPageOptions
  ): Promise<OrgStructureListPage> {
    const offset = options.offset ?? 0;
    const limit = options.limit ?? ORG_STRUCTURE_PAGE_SIZE;
    const query = options.query ?? '';

    if (!IS_MOCK_MODE) {
      return listRealPage({ tab: options.tab, offset, limit, query });
    }

    requireMockOrgManage();
    await delayMockAdminListPage();
    return queryOrgListPage(options.tab, query, offset, limit);
  },

  /**
   * GET /org-structure/:kind/:id — real: province and faculty only for now
   * (Nest has no get-by-id route for either — resolved by scanning the full
   * list instead). Other kinds fall through to mock and resolve to null in
   * real mode.
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
      return getRealEntity(kind, id);
    }
    requireMockOrgManage();
    return mockGetEntity(kind, id);
  },

  /** GET /org-structure/provinces — real: pages GET /api/admin/provinces to collect the full list. */
  async listProvinces(): Promise<OrgProvince[]> {
    if (!IS_MOCK_MODE) {
      return listRealProvinces();
    }
    requireMockOrgManage();
    return mockListProvinces();
  },

  /** GET /org-structure/cities?provinceId= — real: GET /api/admin/provinces/{id}/cities */
  async listCities(provinceId: string): Promise<OrgCity[]> {
    if (!IS_MOCK_MODE) {
      return listRealCities(provinceId);
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
      return listRealDistricts(provinceId, cityId);
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

  /**
   * GET /admin/roles — real: roles a degree/major can link to. Mock mode
   * uses the audience enum instead.
   */
  async listRoles(): Promise<OrgRole[]> {
    if (!IS_MOCK_MODE) {
      return listRealRoles();
    }
    return [];
  },

  /**
   * GET /admin/roles/{roleId}/degrees — real: majors already linked to one
   * role. Not wired into the majors-tab list yet (that tab lists across all
   * roles, see listPage() above) — exposed here for role-scoped lookups.
   */
  async listMajorsByRole(roleId: string): Promise<OrgStructureListItem[]> {
    if (!IS_MOCK_MODE) {
      return listRealMajorsByRole(roleId);
    }
    // Mock mode has no Nest role concept (majors use the fixed `audience`
    // enum instead — see majorFormSchema) so there is nothing to scope by
    // roleId here.
    return [];
  },

  /** PUT /org-structure/provinces — real: POST/PATCH /api/admin/provinces */
  async upsertProvince(
    input: UpsertProvinceInput,
    editId?: string
  ): Promise<void> {
    if (!IS_MOCK_MODE) {
      return upsertRealProvince(input, editId);
    }
    requireMockOrgManage();
    mockUpsertProvince(input, editId);
  },

  /** PUT /org-structure/cities — real: POST/PATCH /api/admin/cities */
  async upsertCity(input: UpsertCityInput, editId?: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      return upsertRealCity(input, editId);
    }
    requireMockOrgManage();
    mockUpsertCity(input, editId);
  },

  /**
   * PUT /org-structure/faculties — real: POST/PUT /api/admin/universites.
   * The Nest entity is called "university" but is surfaced in this UI as
   * the دانشکده/پردیس (faculty) tab.
   */
  async upsertFaculty(
    input: UpsertFacultyInput,
    editId?: string
  ): Promise<void> {
    if (!IS_MOCK_MODE) {
      return upsertRealFaculty(input, editId);
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
      return upsertRealDistrict(input, editId);
    }
    requireMockOrgManage();
    mockUpsertDistrict(input, editId);
  },

  /** PUT /org-structure/schools — real: POST/PUT /api/admin/schools */
  async upsertSchool(input: UpsertSchoolInput, editId?: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      return upsertRealSchool(input, editId);
    }
    requireMockOrgManage();
    mockUpsertSchool(input, editId);
  },

  /** PUT /org-structure/majors — real: POST/PATCH /api/admin/degree. */
  async upsertMajor(input: UpsertMajorInput, editId?: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      return upsertRealMajor(input, editId);
    }
    requireMockOrgManage();
    mockUpsertMajor(input, editId);
  },

  /** DELETE /org-structure/:kind/:id — real: DELETE /api/admin/{kind}/{id} */
  async deleteEntity(kind: OrgStructureEntityKind, id: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      return deleteRealEntity(kind, id);
    }
    requireMockOrgManage();
    mockDeleteEntity(kind, id);
  },
};
