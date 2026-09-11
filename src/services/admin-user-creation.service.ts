import { isMockApiMode } from '@/lib/api-mode';
import { mapNestAdminUser } from '@/services/auth/real/nest-auth-mappers';
import { isStaffAdminRole } from '@/services/auth/real/nest-auth-role';
import { isCreatableStaffAdminRole, isOrgManagementRole } from '@/types/role-taxonomy';
import {
  mockCheckMobileAvailable,
  mockCreateOrganizationalUser,
  mockGetOrgAccountUser,
  mockGetStaffAdmin,
  mockListOrgAccountUsers,
  mockListStaffAdmins,
  mockRemoveOrgAccountUser,
  mockUpdateOrgAccountUser,
  mockUpdateStaffAdmin,
} from '@/services/admin-user-creation/mock/mock-admin-user-creation';
import { accountUsersApi } from '@/services/admin-user-creation/real/account-users.api';
import { resolveOrganizationalRoleId } from '@/services/admin-user-creation/real/account-users-role-lookup';
import { mapNestAccountUser } from '@/services/admin-user-creation/real/account-users.mappers';
import {
  toNestCreateAccountUserDto,
  toNestUpdateAccountUserDto,
} from '@/services/admin-user-creation/real/to-nest-account-user';
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
  OrgAccountRole,
  OrgAccountUser,
  StaffAdminAccount,
  UpdateOrganizationalUserInput,
  UpdateStaffAdminInput,
} from '@/types/admin-user-creation';
import {
  estimateHasNextPageTotal,
  type OffsetLimitPage,
} from '@/utils/offset-limit-page';

/**
 * ایجاد حساب توسط مدیر ارشد.
 * ادمین: POST/GET/PUT `/api/v1/admin/admins` (`role: admin|superadmin`، PUT `status: 2|1`).
 * سازمانی: POST/GET/PATCH/DELETE `/api/v1/admin/account-users`؛ `role` بدنه شناسهٔ نقش
 * است که از GET `/account-users/roles` گرفته می‌شود (نه اسم نقش).
 */

function requireMockUserCreate(): void {
  assertMockClientHasPermission('user.create');
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
   * سازمانی: شناسهٔ نقش از GET /account-users/roles گرفته و POST /account-users زده می‌شود.
   */
  async createOrganizationalUser(
    input: CreateOrganizationalUserInput
  ): Promise<CreateOrganizationalUserResult> {
    if (!isMockApiMode()) {
      if (isStaffAdminRole(input.role)) {
        if (!isCreatableStaffAdminRole(input.role)) {
          throw new Error(
            'ایجاد حساب مدیر ارشد از این فرم مجاز نیست. فقط دستیار ادمین ساخته می‌شود.'
          );
        }
        const raw = await adminsApi.create(toNestCreateAdminDto(input));
        return { user: mapNestAdminUser(raw, input.mobile) };
      }

      if (!isOrgManagementRole(input.role)) {
        throw new Error('این نقش برای ایجاد حساب سازمانی پشتیبانی نمی‌شود.');
      }

      const roleId = await resolveOrganizationalRoleId(input.role);
      const raw = await accountUsersApi.create(
        toNestCreateAccountUserDto(input, roleId)
      );
      return { user: mapNestAccountUser(raw, input.mobile) };
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
    return adminsApi.update(id, toNestUpdateAdminDto(input));
  },

  /**
   * GET /api/v1/admin/account-users?page=&limit=&role= — offset/limit برای جدول حساب‌های سازمانی.
   * فعلاً هیچ صفحه‌ای این متد (و getOrgAccountUser/updateOrgAccountUser/removeOrgAccountUser
   * پایین‌تر) را صدا نمی‌زند — عمداً بدون UI مانده تا وقتی صفحهٔ مدیریت حساب‌های سازمانی ساخته شود؛
   * ناقص یا فراموش‌شده نیست.
   */
  async listOrgAccountUsers(args: {
    offset: number;
    limit: number;
    role?: OrgAccountRole;
  }): Promise<OffsetLimitPage<OrgAccountUser>> {
    if (isMockApiMode()) {
      requireMockUserCreate();
      return mockListOrgAccountUsers(args.offset, args.limit, args.role);
    }

    const page = Math.floor(args.offset / args.limit) + 1;
    const result = await accountUsersApi.list({
      page,
      limit: args.limit,
      role: args.role,
    });
    const items = result.data.map((row) => mapNestAccountUser(row));
    return {
      items,
      total: estimateHasNextPageTotal(args.offset, items.length, result.hasNextPage),
      hasMore: result.hasNextPage,
    };
  },

  /**
   * GET /api/v1/admin/account-users/{id} — لایو روی id نامعتبر/حذف‌شده ۲۰۰ با
   * بدنهٔ `null` می‌دهد نه ۴۰۴؛ همان پیام «یافت نشد» mock را می‌دهیم تا قرارداد
   * دو حالت یکی بماند (ببین account-users.api.ts).
   */
  async getOrgAccountUser(id: string): Promise<OrgAccountUser> {
    if (isMockApiMode()) {
      requireMockUserCreate();
      return mockGetOrgAccountUser(id);
    }
    const raw = await accountUsersApi.getById(id);
    if (!raw) {
      throw new Error('حساب کاربری سازمانی یافت نشد.');
    }
    return mapNestAccountUser(raw);
  },

  /** PATCH /api/v1/admin/account-users/{id} */
  async updateOrgAccountUser(
    id: string,
    input: UpdateOrganizationalUserInput
  ): Promise<OrgAccountUser> {
    if (isMockApiMode()) {
      requireMockUserCreate();
      return mockUpdateOrgAccountUser(id, input);
    }
    if (!isOrgManagementRole(input.role)) {
      throw new Error('این نقش از مسیر ویرایش حساب سازمانی پشتیبانی نمی‌شود.');
    }
    const roleId = await resolveOrganizationalRoleId(input.role);
    const raw = await accountUsersApi.update(
      id,
      toNestUpdateAccountUserDto(input, roleId)
    );
    return mapNestAccountUser(raw, input.mobile);
  },

  /** DELETE /api/v1/admin/account-users/{id} — لایو ۲۰۴. */
  async removeOrgAccountUser(id: string): Promise<void> {
    if (isMockApiMode()) {
      requireMockUserCreate();
      mockRemoveOrgAccountUser(id);
      return;
    }
    await accountUsersApi.remove(id);
  },
};
