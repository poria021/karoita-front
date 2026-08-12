import { isMockApiMode } from '@/lib/api-mode';
import {
  fetchOrganizationOptionsFromApi,
  fetchOrganizationOptionsFromMock,
  ORGANIZATION_OPTIONS_DEFAULT_LIMIT,
  type OrganizationOptionsQuery,
  type OrganizationOptionsResult,
} from '@/services/organization-options/organization-options-helpers';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

const IS_MOCK_MODE = isMockApiMode();

export type { OrganizationField };
export type {
  OrganizationOption,
  OrganizationOptionsQuery,
  OrganizationOptionsResult,
} from '@/services/organization-options/organization-options-helpers';

/**
 * Org typeahead options for profile / admin forms.
 * Nest: GET /organization-options — mock pages labels from OrgStructureService.
 */
export class OrganizationOptionsService {
  /** GET /organization-options */
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
}

export { ORGANIZATION_OPTIONS_DEFAULT_LIMIT as ORGANIZATION_OPTIONS_PAGE_SIZE };
