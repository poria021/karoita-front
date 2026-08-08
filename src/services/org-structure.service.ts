import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { delayMockAdminListPage } from '@/lib/mock-admin-list-delay';
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


const IS_MOCK_MODE = isMockApiMode();

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
  if (!isMockApiMode()) {
    throwRealModeNotImplemented('OrgStructureService');
  }
  assertMockClientHasPermission('organization.manage');
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
  /** GET /org-structure/snapshot */
  async getSnapshot(): Promise<OrgStructureSnapshot> {
    requireMockOrgManage();
    return cloneSnapshot(readOrgSnapshot());
  },

  /** GET /org-structure?tab&query&offset&limit */
  async listPage(
    options: OrgStructureListPageOptions
  ): Promise<OrgStructureListPage> {
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

  /** GET /org-structure/provinces */
  async listProvinces(): Promise<OrgProvince[]> {
    requireMockOrgManage();
    return mockListProvinces();
  },

  /** GET /org-structure/cities?provinceId= */
  async listCities(provinceId: string): Promise<OrgCity[]> {
    requireMockOrgManage();
    return mockListCities(provinceId);
  },

  /** GET /org-structure/districts?provinceId=&cityId= */
  async listDistricts(
    provinceId: string,
    cityId?: string
  ): Promise<OrgDistrict[]> {
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

  /** PUT /org-structure/provinces */
  async upsertProvince(
    input: UpsertProvinceInput,
    editId?: string
  ): Promise<void> {
    requireMockOrgManage();
    mockUpsertProvince(input, editId);
  },

  /** PUT /org-structure/cities */
  async upsertCity(input: UpsertCityInput, editId?: string): Promise<void> {
    requireMockOrgManage();
    mockUpsertCity(input, editId);
  },

  /** PUT /org-structure/faculties */
  async upsertFaculty(
    input: UpsertFacultyInput,
    editId?: string
  ): Promise<void> {
    requireMockOrgManage();
    mockUpsertFaculty(input, editId);
  },

  /** PUT /org-structure/districts */
  async upsertDistrict(
    input: UpsertDistrictInput,
    editId?: string
  ): Promise<void> {
    requireMockOrgManage();
    mockUpsertDistrict(input, editId);
  },

  /** PUT /org-structure/schools */
  async upsertSchool(input: UpsertSchoolInput, editId?: string): Promise<void> {
    requireMockOrgManage();
    mockUpsertSchool(input, editId);
  },

  /** PUT /org-structure/majors */
  async upsertMajor(input: UpsertMajorInput, editId?: string): Promise<void> {
    requireMockOrgManage();
    mockUpsertMajor(input, editId);
  },

  /** DELETE /org-structure/:kind/:id */
  async deleteEntity(kind: OrgStructureEntityKind, id: string): Promise<void> {
    requireMockOrgManage();
    mockDeleteEntity(kind, id);
  },
};
