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
 *   district → GET /api/admin/educations          (paginated)
 *   school   → GET /api/admin/schools/all         (paginated)
 *   college  → GET /api/admin/universites         (paginated)
 *   major    → GET /api/admin/degreeee            (bare array, title)
 *
 * Mock mode: از OrgStructureService.listLabelsForField استفاده می‌کند.
 */
export class OrganizationOptionsService {
  static async getOptions(
    params: OrganizationOptionsQuery
  ): Promise<OrganizationOptionsResult> {
    const request = buildOrganizationOptionsRequest(params);

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

/** همان payload که به Nest typeahead می‌رود — `city` نباید حذف شود. */
export function buildOrganizationOptionsRequest(
  params: OrganizationOptionsQuery
) {
  return {
    type: params.type,
    query: params.query,
    page: params.page ?? 1,
    limit: params.limit ?? ORGANIZATION_OPTIONS_DEFAULT_LIMIT,
    province: params.province,
    city: params.city,
    district: params.district,
    signal: params.signal,
  };
}
