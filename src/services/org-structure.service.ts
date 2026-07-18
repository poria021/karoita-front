import { isMockApiMode, REAL_MODE_NOT_IMPLEMENTED } from '@/lib/api-mode';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import {
  cloneSnapshot,
  readOrgSnapshot,
} from '@/services/org-structure/mock-org-store';
import {
  listLabelsForField as queryLabelsForField,
  queryOrgListAll,
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

/**
 * Facade for organizational structure CRUD (rule 40).
 * Mock: localStorage snapshot + client permission check (UX sim — NOT Nest authz).
 * Real: not wired yet — callers get REAL_MODE_NOT_IMPLEMENTED.
 */

const IS_MOCK_MODE = isMockApiMode();

/** Nest-aligned page size for org list tables. */
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
  if (!isMockApiMode()) throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  assertMockClientHasPermission('organization.manage');
}

export const OrgStructureService = {
  async getSnapshot(): Promise<OrgStructureSnapshot> {
    requireMockOrgManage();
    return cloneSnapshot(readOrgSnapshot());
  },

  /** Full list (legacy). Prefer {@link listPage} for admin tables. */
  async listByTab(
    tab: OrgStructureSubTab,
    query = ''
  ): Promise<OrgStructureListItem[]> {
    requireMockOrgManage();
    return queryOrgListAll(tab, query);
  },

  /**
   * Offset/limit page for infinite-scroll tables (Nest contract: limit=10).
   * Mock: filter/sort tab rows, slice page, then O(1) deleteBlocked via index.
   */
  async listPage(
    options: OrgStructureListPageOptions
  ): Promise<OrgStructureListPage> {
    requireMockOrgManage();
    const offset = options.offset ?? 0;
    const limit = options.limit ?? ORG_STRUCTURE_PAGE_SIZE;
    const query = options.query ?? '';
    if (offset > 0) {
      await new Promise((resolve) => setTimeout(resolve, 550));
    }
    return queryOrgListPage(options.tab, query, offset, limit);
  },

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

  async listProvinces(): Promise<OrgProvince[]> {
    requireMockOrgManage();
    return mockListProvinces();
  },

  async listCities(provinceId: string): Promise<OrgCity[]> {
    requireMockOrgManage();
    return mockListCities(provinceId);
  },

  async listDistricts(
    provinceId: string,
    cityId?: string
  ): Promise<OrgDistrict[]> {
    requireMockOrgManage();
    return mockListDistricts(provinceId, cityId);
  },

  listLabelsForField(
    field: 'province' | 'city' | 'college' | 'district' | 'school' | 'major',
    provinceName = '',
    districtName = ''
  ): string[] {
    if (!IS_MOCK_MODE) return [];
    return queryLabelsForField(field, provinceName, districtName);
  },

  async upsertProvince(
    input: UpsertProvinceInput,
    editId?: string
  ): Promise<void> {
    requireMockOrgManage();
    mockUpsertProvince(input, editId);
  },

  async upsertCity(input: UpsertCityInput, editId?: string): Promise<void> {
    requireMockOrgManage();
    mockUpsertCity(input, editId);
  },

  async upsertFaculty(
    input: UpsertFacultyInput,
    editId?: string
  ): Promise<void> {
    requireMockOrgManage();
    mockUpsertFaculty(input, editId);
  },

  async upsertDistrict(
    input: UpsertDistrictInput,
    editId?: string
  ): Promise<void> {
    requireMockOrgManage();
    mockUpsertDistrict(input, editId);
  },

  async upsertSchool(input: UpsertSchoolInput, editId?: string): Promise<void> {
    requireMockOrgManage();
    mockUpsertSchool(input, editId);
  },

  async upsertMajor(input: UpsertMajorInput, editId?: string): Promise<void> {
    requireMockOrgManage();
    mockUpsertMajor(input, editId);
  },

  async deleteEntity(kind: OrgStructureEntityKind, id: string): Promise<void> {
    requireMockOrgManage();
    mockDeleteEntity(kind, id);
  },
};
