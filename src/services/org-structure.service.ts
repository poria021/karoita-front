import { IS_MOCK_MODE } from '@/lib/api-mode';
import {
  mockOrgCities,
  mockOrgDistricts,
  mockOrgEntity,
  mockOrgLabelsForField,
  mockOrgListPage,
  mockOrgProvinces,
  mockOrgSnapshot,
} from '@/services/org-structure/mock/org-structure.fixtures';
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
  rememberOrgRelationLabels,
  type OrgRelationLabelOverlay,
} from '@/services/org-structure/real/org-relation-label-overlay';
import {
  flushBareListCache,
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
  OrgStructureListItem,
  OrgStructureListPage,
  OrgStructureSnapshot,
  OrgStructureSubTab,
  UpsertCityInput,
  UpsertDistrictInput,
  UpsertFacultyInput,
  UpsertMajorInput,
  UpsertProvinceInput,
  UpsertSchoolInput,
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

/**
 * Facade ساختار سازمانی — لیست صفحه‌بندی‌شده و CRUD.
 * mock: فقط داده‌ی ثابت (نوشتن‌ها چیزی ذخیره نمی‌کنند)؛ real به `real-org-*`.
 * رشته در Nest یعنی `degree` (`/admin/degreeee`)؛ پردیس یعنی `universites`.
 */
export const OrgStructureService = {
  /** GET snapshot — real از provinces+cities+districts+schools+faculties جمع می‌شود. */
  async getSnapshot(): Promise<OrgStructureSnapshot> {
    if (!IS_MOCK_MODE) {
      return getRealSnapshot();
    }
    return mockOrgSnapshot();
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

    return mockOrgListPage(options.tab, query, offset, limit);
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
    return mockOrgEntity(kind, id);
  },

  /** همهٔ استان‌ها — real صفحات GET /admin/provinces را جمع می‌کند. */
  async listProvinces(): Promise<OrgProvince[]> {
    if (!IS_MOCK_MODE) {
      return listRealProvinces();
    }
    return mockOrgProvinces();
  },

  /** شهرهای یک استان — real: GET /admin/provinces/{id}/cities. */
  async listCities(provinceId: string): Promise<OrgCity[]> {
    if (!IS_MOCK_MODE) {
      return listRealCities(provinceId);
    }
    return mockOrgCities(provinceId);
  },

  /** مناطق — real: GET /admin/educations?provinceId (بدون cityId؛ لایو ۵۰۰ می‌دهد). */
  async listDistricts(
    provinceId: string,
    cityId?: string
  ): Promise<OrgDistrict[]> {
    if (!IS_MOCK_MODE) {
      return listRealDistricts(provinceId, cityId);
    }
    return mockOrgDistricts(provinceId, cityId);
  },

  /** برچسب typeahead پروفایل — فقط mock؛ real از OrganizationOptionsService. */
  listLabelsForField(
    field: 'province' | 'city' | 'college' | 'district' | 'school' | 'major',
    provinceName = '',
    districtName = '',
    majorAudience?: OrgMajorAudience
  ): string[] {
    if (!IS_MOCK_MODE) return [];
    return mockOrgLabelsForField(field, provinceName, districtName, majorAudience);
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
  },

  /** POST/PATCH /admin/cities. */
  async upsertCity(input: UpsertCityInput, editId?: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      return upsertRealCity(input, editId);
    }
  },

  /** POST/PUT /admin/universites — university Nest همان تب پردیس است. */
  async upsertFaculty(
    input: UpsertFacultyInput,
    editId?: string
  ): Promise<void> {
    if (!IS_MOCK_MODE) {
      return upsertRealFaculty(input, editId);
    }
  },

  /** POST/PUT /admin/educations. */
  async upsertDistrict(
    input: UpsertDistrictInput,
    editId?: string
  ): Promise<void> {
    if (!IS_MOCK_MODE) {
      return upsertRealDistrict(input, editId);
    }
  },

  /** POST/PUT /admin/schools. */
  async upsertSchool(input: UpsertSchoolInput, editId?: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      return upsertRealSchool(input, editId);
    }
  },

  /** POST/PUT /admin/degree. */
  async upsertMajor(input: UpsertMajorInput, editId?: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      return upsertRealMajor(input, editId);
    }
  },

  /** DELETE /admin/{kind}/{id} — مدرسه بدون `/` قبل از id. */
  async deleteEntity(kind: OrgStructureEntityKind, id: string): Promise<void> {
    if (!IS_MOCK_MODE) {
      return deleteRealEntity(kind, id);
    }
  },

  /** فقط real: کش لیست خام بعد از mutation — در mock no-op. */
  flushListCache(tab?: OrgStructureSubTab): void {
    if (IS_MOCK_MODE) return;
    flushBareListCache(tab);
  },

  /**
   * فقط real: برچسب روابط را برای ردیف تازه/ویرایش‌شده نگه می‌دارد
   * (Nest تو در تو province/city برنمی‌گرداند).
   */
  rememberRelationLabels(
    keys: Array<string | undefined>,
    labels: OrgRelationLabelOverlay
  ): void {
    if (IS_MOCK_MODE) return;
    rememberOrgRelationLabels(keys, labels);
  },
};
