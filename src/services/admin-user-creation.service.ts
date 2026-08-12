import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import {
  mockCheckMobileAvailable,
  mockCreateOrganizationalUser,
} from '@/services/admin-user-creation/mock-admin-user-creation';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import type {
  CreateOrganizationalUserInput,
  CreateOrganizationalUserResult,
  MobileAvailabilityResult,
} from '@/types/admin-user-creation';

/**
 * Super-admin org account creation.
 * DTO stays stable across mock→Nest; only transport swaps here.
 *
 * Nest map:
 * - GET  /admin/users/mobile-availability?mobile=
 * - POST /admin/users
 */

function requireMockUserCreate(): void {
  if (!isMockApiMode()) {
    throwRealModeNotImplemented('AdminUserCreationService');
  }
  assertMockClientHasPermission('user.create');
}

export const AdminUserCreationService = {
  /** GET /admin/users/mobile-availability?mobile= */
  async checkMobileAvailable(
    mobile: string
  ): Promise<MobileAvailabilityResult> {
    requireMockUserCreate();
    return { available: mockCheckMobileAvailable(mobile) };
  },

  /** POST /admin/users */
  async createOrganizationalUser(
    input: CreateOrganizationalUserInput
  ): Promise<CreateOrganizationalUserResult> {
    requireMockUserCreate();
    return mockCreateOrganizationalUser(input);
  },
};
