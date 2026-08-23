import { IS_MOCK_MODE } from '@/lib/api-mode';
import {
  fetchOrganizationOptionsFromApi,
  fetchOrganizationOptionsFromMock,
  invalidateDistrictNameCache,
  invalidateProvinceNameCache,
  ORGANIZATION_OPTIONS_DEFAULT_LIMIT,
  type OrganizationOptionsQuery,
  type OrganizationOptionsResult,
} from '@/services/organization-options/organization-options-helpers';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

export type { OrganizationField };
export type {
  OrganizationOption,
  OrganizationOptionsQuery,
  OrganizationOptionsResult,
} from '@/services/organization-options/organization-options-helpers';

/**
 * Org typeahead options for profile / admin forms.
 *
 * Real mode: مستقیم به Nest Admin API وصل می‌شود
 *   province → GET /api/admin/provinces          (paginated, filters param)
 *   city     → GET /api/admin/provinces/{id}/cities  یا /api/admin/cities
 *   district → GET /api/admin/educations          (bare array, provinceId)
 *   school   → GET /api/admin/schools             (bare array, educationId)
 *   college  → GET /api/admin/universites         (bare array, title)
 *   major    → GET /api/admin/degreeee            (bare array, title)
 *
 * Mock mode: از OrgStructureService.listLabelsForField استفاده می‌کند.
 */
export class OrganizationOptionsService {
  static async getOptions(
    params: OrganizationOptionsQuery
  ): Promise<OrganizationOptionsResult> {
    const page = params.page ?? 1;
    const limit = params.limit ?? ORGANIZATION_OPTIONS_DEFAULT_LIMIT;
    const request = {
      type: params.type,
      query: params.query,
      page,
      limit,
      province: params.province,
      district: params.district,
      signal: params.signal,
    };

    if (!IS_MOCK_MODE) {
      return fetchOrganizationOptionsFromApi(request);
    }

    return fetchOrganizationOptionsFromMock(request);
  }

  /**
   * کش استان را باطل می‌کند.
   * پس از ایجاد/ویرایش/حذف استان در پنل ادمین صدا بزن.
   */
  static invalidateProvinceCache(): void {
    invalidateProvinceNameCache();
  }

  /**
   * کش منطقه آموزشی را باطل می‌کند.
   * پس از ایجاد/ویرایش/حذف منطقه در پنل ادمین صدا بزن.
   */
  static invalidateDistrictCache(): void {
    invalidateDistrictNameCache();
  }
}

export { ORGANIZATION_OPTIONS_DEFAULT_LIMIT as ORGANIZATION_OPTIONS_PAGE_SIZE };
