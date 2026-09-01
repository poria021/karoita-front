import { isMockApiMode } from '@/lib/api-mode';
import { ApiClientError } from '@/services/api-error';
import { mapNestAdminUser, mapNestAuthUser } from '@/services/auth/real/nest-auth-mappers';
import { isStaffAdminRole } from '@/services/auth/real/nest-auth-role';
import { isCreatableStaffAdminRole } from '@/types/role-taxonomy';
import {
  mockCheckMobileAvailable,
  mockCreateOrganizationalUser,
  mockGetStaffAdmin,
  mockListStaffAdmins,
  mockUpdateStaffAdmin,
} from '@/services/admin-user-creation/mock/mock-admin-user-creation';
import { adminsApi } from '@/services/admin-user-creation/real/admins.api';
import {
  nestPhonesMatch,
  toNestAdminPhone,
  toNestCreateAdminDto,
  toNestUpdateAdminDto,
} from '@/services/admin-user-creation/real/to-nest-admin-create';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import { usersApi } from '@/services/users/users.api';
import type {
  CreateOrganizationalUserInput,
  CreateOrganizationalUserResult,
  MobileAvailabilityResult,
  StaffAdminAccount,
  UpdateStaffAdminInput,
} from '@/types/admin-user-creation';
import {
  estimateHasNextPageTotal,
  type OffsetLimitPage,
} from '@/utils/offset-limit-page';

/**
 * ایجاد حساب توسط مدیر ارشد.
 * ادمین: POST/GET/PUT `/api/v1/admin/admins` (`role: admin|superadmin`، PUT `status: 2|1`).
 * سازمانی: چک موبایل با GET `/api/v1/users?filters=`؛ PATCH `/users/{id}` نقش را روی کاربر موجود می‌گذارد.
 */

function requireMockUserCreate(): void {
  assertMockClientHasPermission('user.create');
}

function toDuplicateMobileError(error: unknown): never {
  if (error instanceof ApiClientError && error.status === 409) {
    throw new ApiClientError(
      'این شماره موبایل قبلاً در سیستم ثبت شده است.',
      409,
      error.payload
    );
  }
  throw error;
}

export const AdminUserCreationService = {
  /**
   * آیا موبایل ثبت شده — real: GET `/api/v1/users?filters={"phone":"..."}&limit=1`.
   */
  async checkMobileAvailable(
    mobile: string
  ): Promise<MobileAvailabilityResult> {
    if (!isMockApiMode()) {
      const result = await usersApi.list({
        page: 1,
        limit: 1,
        filters: JSON.stringify({ phone: toNestAdminPhone(mobile) }),
      });
      // اگر Nest فیلتر phone را نادیده بگیرد، اولین کاربر سیستم می‌آید؛ تکراری فقط با تطابق شماره.
      const rows = Array.isArray(result.data) ? result.data : [];
      return {
        available: !rows.some((row) => nestPhonesMatch(row.phone, mobile)),
      };
    }
    requireMockUserCreate();
    return { available: mockCheckMobileAvailable(mobile) };
  },

  /**
   * ادمین: POST /admin/admins بدون password (CreateAdmin فیلد ندارد).
   * سازمانی real هنوز `userId` کاربر موجود از جریان auth می‌خواهد.
   */
  async createOrganizationalUser(
    input: CreateOrganizationalUserInput & { userId?: string }
  ): Promise<CreateOrganizationalUserResult> {
    if (!isMockApiMode()) {
      if (isStaffAdminRole(input.role)) {
        if (!isCreatableStaffAdminRole(input.role)) {
          throw new Error(
            'ایجاد حساب مدیر ارشد از این فرم مجاز نیست. فقط دستیار ادمین ساخته می‌شود.'
          );
        }
        try {
          const raw = await adminsApi.create(toNestCreateAdminDto(input));
          return { user: mapNestAdminUser(raw, input.mobile) };
        } catch (error) {
          toDuplicateMobileError(error);
        }
      }

      if (!input.userId) {
        throw new Error(
          'برای ایجاد حساب سازمانی در حالت واقعی، شناسه کاربر (userId) الزامی است.'
        );
      }
      const raw = await usersApi.update(input.userId, {
        firstName: input.firstName,
        lastName: input.lastName,
        documentStatus: 'CONFIRM',
        provinceId: '',
        universityId: '',
        degreeId: '',
        userUniqueId: '',
        cityIds: [],
        schoolIds: [],
        educationalDistrictsIds: [],
      });
      return { user: mapNestAuthUser(raw) };
    }
    requireMockUserCreate();
    return mockCreateOrganizationalUser(input);
  },

  /**
   * GET /api/v1/admin/admins — offset/limit برای جدول ادمین.
   * Nest فقط page/limit و hasNextPage دارد.
   */
  async listStaffAdmins(args: {
    offset: number;
    limit: number;
  }): Promise<OffsetLimitPage<StaffAdminAccount>> {
    if (isMockApiMode()) {
      requireMockUserCreate();
      return mockListStaffAdmins(args.offset, args.limit);
    }

    const page = Math.floor(args.offset / args.limit) + 1;
    const result = await adminsApi.list({ page, limit: args.limit });
    return {
      items: result.data,
      total: estimateHasNextPageTotal(
        args.offset,
        result.data.length,
        result.hasNextPage
      ),
      hasMore: result.hasNextPage,
    };
  },

  /** GET /api/v1/admin/admins/{id} */
  async getStaffAdmin(id: string): Promise<StaffAdminAccount> {
    if (isMockApiMode()) {
      requireMockUserCreate();
      return mockGetStaffAdmin(id);
    }
    return adminsApi.getById(id);
  },

  /** PUT /api/v1/admin/admins/{id} — status: 2 فعال، 1 غیرفعال */
  async updateStaffAdmin(
    id: string,
    input: UpdateStaffAdminInput
  ): Promise<StaffAdminAccount> {
    if (isMockApiMode()) {
      requireMockUserCreate();
      return mockUpdateStaffAdmin(id, input);
    }
    try {
      return await adminsApi.update(id, toNestUpdateAdminDto(input));
    } catch (error) {
      toDuplicateMobileError(error);
    }
  },
};
