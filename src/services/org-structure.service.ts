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
  OrgMajorAudience,
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
    // حالت real — گارد mock را رد کن؛ شاخهٔ Nest جدا است.
    return;
  }
  assertMockClientHasPermission('organization.manage');
}

/**
 * Facade ساختار سازمانی — لیست صفحه‌بندی‌شده و CRUD.
 * این فایل فقط `IS_MOCK_MODE` و گارد مجوز است؛ mock به `mock-org-*` و real به `real-org-*`.
 * رشته در Nest یعنی `degree` (`/admin/degreeee`)؛ پردیس یعنی `universites`.
 */
export const OrgStructureService = {
  /** GET snapshot — real از provinces+cities+districts+schools+faculties جمع می‌شود. */
  async getSnapshot(): Promise<OrgStructureSnapshot> {
    if (!IS_MOCK_MODE) {
      return getRealSnapshot();
    }
    requireMockOrgManage();
    return cloneSnapshot(readOrgSnapshot());
  },

  /** لیست صفحه‌بندی‌شده؛ رشته → GET /admin/degreeee، پردیس → GET /admin/universites. */
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

  /** شهر از GET /admin/cities/{id}؛ استان/پردیس get-by-id ندارند. */
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

  /** همهٔ استان‌ها — real صفحات GET /admin/provinces را جمع می‌کند. */
  async listProvinces(): Promise<OrgProvince[]> {
    if (!IS_MOCK_MODE) {
      return listRealProvinces();
    }
    requireMockOrgManage();
    return mockListProvinces();
  },

  /** شهرهای یک استان — real: GET /admin/provinces/{id}/cities. */
  async listCities(provinceId: string): Promise<OrgCity[]> {
    if (!IS_MOCK_MODE) {
      return listRealCities(provinceId);
    }
    requireMockOrgManage();
    return mockListCities(provinceId);
  },

  /** مناطق — real: GET /admin/educations?provinceId (بدون cityId؛ لایو ۵۰۰ می‌دهد). */
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

  /** برچسب typeahead پروفایل — فقط mock؛ real از OrganizationOptionsService. */
  listLabelsForField(
    field: 'province' | 'city' | 'college' | 'district' | 'school' | 'major',
    provinceName = '',
    districtName = '',
    majorAudience?: OrgMajorAudience
  ): string[] {
    if (!IS_MOCK_MODE) return [];
    return queryLabelsForField(field, provinceName, districtName, majorAudience);
  },

  /** GET /admin/roles — نقش‌هایی که رشته می‌تواند به آن‌ها وصل شود؛ mock خالی. */
  async listRoles(): Promise<OrgRole[]> {
    if (!IS_MOCK_MODE) {
      return listRealRoles();
    }
    return [];
  },

  /** GET /admin/roles/{roleId}/degrees — رشته‌های یک نقش؛ تب majors هنوز همهٔ نقش‌ها را لیست می‌کند. */
  async listMajorsByRole(roleId: string): Promise<OrgStructureListItem[]> {
    if (!IS_MOCK_MODE) {
      return listRealMajorsByRole(roleId);
    }
    // mock نقش Nest ندارد؛ رشته با enum `audience` است (ببین majorFormSchema).
    return [];
  },

  /** POST/PATCH /admin/provinces. */
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

  /** POST/PATCH /admin/cities. */
  async upsertCity(input: UpsertCityInput, editId?: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      return upsertRealCity(input, editId);
    }
    requireMockOrgManage();
    mockUpsertCity(input, editId);
  },

  /** POST/PUT /admin/universites — university Nest همان تب پردیس است. */
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

  /** POST/PUT /admin/educations. */
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

  /** POST/PUT /admin/schools. */
  async upsertSchool(input: UpsertSchoolInput, editId?: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      return upsertRealSchool(input, editId);
    }
    requireMockOrgManage();
    mockUpsertSchool(input, editId);
  },

  /** POST/PUT /admin/degree. */
  async upsertMajor(input: UpsertMajorInput, editId?: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      return upsertRealMajor(input, editId);
    }
    requireMockOrgManage();
    mockUpsertMajor(input, editId);
  },

  /** DELETE /admin/{kind}/{id} — مدرسه بدون `/` قبل از id. */
  async deleteEntity(kind: OrgStructureEntityKind, id: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      return deleteRealEntity(kind, id);
    }
    requireMockOrgManage();
    mockDeleteEntity(kind, id);
  },
};
