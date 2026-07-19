/**
 * Canonical Facade lives in `src/services/organization-options.service.ts`.
 * Re-export kept so existing feature imports stay stable (rule 40).
 */
export {
  ORGANIZATION_OPTIONS_PAGE_SIZE,
  OrganizationOptionsService,
  type OrganizationField,
  type OrganizationOption,
  type OrganizationOptionsQuery,
  type OrganizationOptionsResult,
} from '@/services/organization-options.service';
