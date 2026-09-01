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
 * Typeahead سازمانی پروفایل/ادمین.
 * Real مستقیم به کاتالوگ Nest می‌رود (`universites`/`degreeee` املای لایو)؛ mock از `OrgStructureService.listLabelsForField`.
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

  /** کش استان را باطل کن؛ بعد از CRUD استان در پنل ادمین. */
  static invalidateProvinceCache(): void {
    invalidateProvinceNameCache();
  }

  /** کش منطقه آموزشی را باطل کن؛ بعد از CRUD منطقه در پنل ادمین. */
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
    role: params.role,
    signal: params.signal,
  };
}
