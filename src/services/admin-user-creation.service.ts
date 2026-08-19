import { isMockApiMode } from '@/lib/api-mode';
import { mapNestAuthUser } from '@/services/auth/nest-auth-mappers';
import {
  mockCheckMobileAvailable,
  mockCreateOrganizationalUser,
} from '@/services/admin-user-creation/mock-admin-user-creation';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import { usersApi } from '@/services/users/users.api';
import type {
  CreateOrganizationalUserInput,
  CreateOrganizationalUserResult,
  MobileAvailabilityResult,
} from '@/types/admin-user-creation';

/**
 * Super-admin org account creation.
 *
 * Nest map (via existing Users API):
 * - GET  /api/v1/users?filters={"phone":"<mobile>"}&limit=1  → mobile availability check
 * - PATCH /api/v1/users/{id} role+status → create/assign org role
 *
 * Note: Swagger has no POST /admin/users endpoint — we use PATCH /api/v1/users/{id}
 * to assign role after the user is found/created through the auth flow.
 */

const IS_MOCK_MODE = isMockApiMode();

function requireMockUserCreate(): void {
  assertMockClientHasPermission('user.create');
}

export const AdminUserCreationService = {
  /**
   * Check whether a mobile number is already registered.
   * Real: GET /api/v1/users?filters={"phone":"<mobile>"}&limit=1
   */
  async checkMobileAvailable(
    mobile: string
  ): Promise<MobileAvailabilityResult> {
    if (!IS_MOCK_MODE) {
      const result = await usersApi.list({
        page: 1,
        limit: 1,
        filters: JSON.stringify({ phone: mobile }),
      });
      return { available: result.data.length === 0 };
    }
    requireMockUserCreate();
    return { available: mockCheckMobileAvailable(mobile) };
  },

  /**
   * Create/assign organizational user.
   * Real: PATCH /api/v1/users/{id} with role + required profile fields.
   * Requires the user to already exist (registered via auth flow).
   * Pass `userId` when calling in real mode — input.mobile is used in mock.
   */
  async createOrganizationalUser(
    input: CreateOrganizationalUserInput & { userId?: string }
  ): Promise<CreateOrganizationalUserResult> {
    if (!IS_MOCK_MODE) {
      if (!input.userId) {
        throw new Error(
          'برای ایجاد حساب سازمانی در حالت واقعی، شناسه کاربر (userId) الزامی است.'
        );
      }
      const raw = await usersApi.update(input.userId, {
        firstName: input.firstName,
        lastName: input.lastName,
        documentStatus: 'PENDING',
        rejectDescription: [],
        provinceId: '',
        universityId: '',
        degreeId: '',
        userUniqueId: '',
        cityId: '',
        schoolId: '',
        educationalDistrictsId: '',
      });
      return { user: mapNestAuthUser(raw) };
    }
    requireMockUserCreate();
    return mockCreateOrganizationalUser(input);
  },
};
