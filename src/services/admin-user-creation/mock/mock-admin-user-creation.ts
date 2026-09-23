import {
  mockMobileExists,
  patchMockAuthUser,
  readMockUsers,
  removeMockUser,
  toPublicUser,
  writeMockUsers,
} from '@/services/auth/mock/mock-auth.store';
import type { MockAuthUserRecord } from '@/services/auth/mock/auth-mock-users';
import type {
  CreateOrganizationalUserInput,
  CreateOrganizationalUserResult,
  OrgAccountRole,
  OrgAccountUser,
  StaffAdminAccount,
  UpdateOrganizationalUserInput,
  UpdateStaffAdminInput,
} from '@/types/admin-user-creation';
import {
  isCreatableStaffAdminRole,
  isOrgManagementRole,
  isStaffAdminRole,
} from '@/types/role-taxonomy';
import { sliceOffsetLimitPage } from '@/utils/offset-limit-page';
import { persianToEnglishDigits } from '@/utils/persianDigits';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
} from '@/utils/passwordInput';
import {
  orgAccountRequiresCity,
  orgAccountRequiresCollege,
  orgAccountRequiresDistrict,
  orgAccountRequiresProvince,
} from '@/utils/roleFieldStrategy';

export function normalizeMobile(mobile: string): string {
  return persianToEnglishDigits(mobile).replace(/\D/g, '').slice(0, 10);
}

function buildOrgFields(
  role: OrgAccountRole,
  input: CreateOrganizationalUserInput
): Pick<
  MockAuthUserRecord,
  'province' | 'city' | 'college' | 'district' | 'school' | 'major'
> {
  // فیلدهای موقعیت سازمانی به صورت string[] ذخیره می‌شوند (چندانتخابی)
  const provinceVal = input.province?.trim() ?? '';
  const cityVal = input.city?.trim() ?? '';
  const collegeVal = input.college?.trim() ?? '';
  const districtVal = input.district?.trim() ?? '';

  return {
    province: orgAccountRequiresProvince(role) && provinceVal ? [provinceVal] : [],
    city: orgAccountRequiresCity(role) && cityVal ? [cityVal] : [],
    college: orgAccountRequiresCollege(role) && collegeVal ? [collegeVal] : [],
    district: orgAccountRequiresDistrict(role) && districtVal ? [districtVal] : [],
    school: [],
    major: '',
  };
}

export function mockCreateOrganizationalUser(
  input: CreateOrganizationalUserInput
): CreateOrganizationalUserResult {
  if (isStaffAdminRole(input.role) && !isCreatableStaffAdminRole(input.role)) {
    throw new Error(
      'ایجاد حساب مدیر ارشد از این فرم مجاز نیست. فقط دستیار ادمین ساخته می‌شود.'
    );
  }

  const mobile = normalizeMobile(input.mobile);
  if (!/^9\d{9}$/.test(mobile)) {
    throw new Error('فرمت شماره موبایل معتبر نیست (۱۰ رقم بدون صفر اول).');
  }
  if (mockMobileExists(mobile)) {
    throw new Error('این شماره موبایل قبلاً در سیستم ثبت شده است.');
  }

  const password = input.password.trim();
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(PASSWORD_MIN_LENGTH_MESSAGE);
  }

  const org = buildOrgFields(input.role, input);
  if (orgAccountRequiresProvince(input.role) && !org.province?.length) {
    throw new Error('انتخاب استان الزامی است.');
  }
  if (orgAccountRequiresCollege(input.role) && !org.college?.length) {
    throw new Error('انتخاب دانشکده / پردیس الزامی است.');
  }
  if (
    (orgAccountRequiresCity(input.role) && !org.city?.length) ||
    (orgAccountRequiresDistrict(input.role) && !org.district?.length)
  ) {
    throw new Error('انتخاب شهر و منطقه آموزشی الزامی است.');
  }

  const record: MockAuthUserRecord = {
    id: `#U-${Date.now()}`,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    mobile,
    role: input.role,
    password,
    hasPassword: true,
    approved: true,
    docStatus: 'approved',
    personalCode: '',
    ...org,
  };

  writeMockUsers([...readMockUsers(), record]);
  return { user: toPublicUser(record) };
}

export function mockCheckMobileAvailable(mobile: string): boolean {
  const normalized = normalizeMobile(mobile);
  if (!/^9\d{9}$/.test(normalized)) {
    return true;
  }
  return !mockMobileExists(normalized);
}

function toStaffAdminAccount(record: MockAuthUserRecord): StaffAdminAccount {
  return {
    id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    mobile: record.mobile,
    role: record.role,
    statusName: record.approved ? 'active' : 'inactive',
    createdAt: '',
  };
}

export function mockListStaffAdmins(offset: number, limit: number) {
  const rows = readMockUsers()
    .filter((record) => isStaffAdminRole(record.role))
    .map(toStaffAdminAccount);
  return sliceOffsetLimitPage(rows, offset, limit);
}

export function mockGetStaffAdmin(id: string): StaffAdminAccount {
  const record = readMockUsers().find(
    (item) => item.id === id && isStaffAdminRole(item.role)
  );
  if (!record) {
    throw new Error('حساب ادمین یافت نشد.');
  }
  return toStaffAdminAccount(record);
}

export function mockUpdateStaffAdmin(
  id: string,
  input: UpdateStaffAdminInput
): StaffAdminAccount {
  const record = readMockUsers().find(
    (item) => item.id === id && isStaffAdminRole(item.role)
  );
  if (!record) {
    throw new Error('حساب ادمین یافت نشد.');
  }
  if (!isStaffAdminRole(input.role)) {
    throw new Error('این نقش از مسیر ویرایش ادمین پشتیبانی نمی‌شود.');
  }

  const mobile = normalizeMobile(input.mobile);
  if (!/^9\d{9}$/.test(mobile)) {
    throw new Error('فرمت شماره موبایل معتبر نیست (۱۰ رقم بدون صفر اول).');
  }
  if (mobile !== record.mobile && mockMobileExists(mobile)) {
    throw new Error('این شماره موبایل قبلاً در سیستم ثبت شده است.');
  }

  const updated = patchMockAuthUser(
    { id },
    {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      mobile,
      role: input.role,
      approved: input.active,
    }
  );
  return toStaffAdminAccount(updated);
}

/** GET /api/v1/admin/account-users — شبیه‌سازی محلی، فقط نقش‌های سازمانی (بدون ادمین/مدیر ارشد). */
export function mockListOrgAccountUsers(
  offset: number,
  limit: number,
  role?: OrgAccountRole
) {
  const rows = readMockUsers()
    .filter((record) => isOrgManagementRole(record.role))
    .filter((record) => !role || record.role === role)
    .map(toPublicUser);
  return sliceOffsetLimitPage(rows, offset, limit);
}

export function mockGetOrgAccountUser(id: string): OrgAccountUser {
  const record = readMockUsers().find(
    (item) => item.id === id && isOrgManagementRole(item.role)
  );
  if (!record) {
    throw new Error('حساب کاربری سازمانی یافت نشد.');
  }
  return toPublicUser(record);
}

export function mockUpdateOrgAccountUser(
  id: string,
  input: UpdateOrganizationalUserInput
): OrgAccountUser {
  const record = readMockUsers().find(
    (item) => item.id === id && isOrgManagementRole(item.role)
  );
  if (!record) {
    throw new Error('حساب کاربری سازمانی یافت نشد.');
  }
  if (!isOrgManagementRole(input.role)) {
    throw new Error('این نقش از مسیر ویرایش حساب سازمانی پشتیبانی نمی‌شود.');
  }

  const mobile = normalizeMobile(input.mobile);
  if (!/^9\d{9}$/.test(mobile)) {
    throw new Error('فرمت شماره موبایل معتبر نیست (۱۰ رقم بدون صفر اول).');
  }
  if (mobile !== record.mobile && mockMobileExists(mobile)) {
    throw new Error('این شماره موبایل قبلاً در سیستم ثبت شده است.');
  }

  const org = buildOrgFields(input.role, {
    ...input,
    mobile,
    password: input.password ?? record.password,
  });

  const updated = patchMockAuthUser(
    { id },
    {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      mobile,
      role: input.role,
      ...(input.password?.trim() ? { password: input.password.trim() } : {}),
      ...org,
    }
  );
  return toPublicUser(updated);
}

export function mockRemoveOrgAccountUser(id: string): void {
  const record = readMockUsers().find(
    (item) => item.id === id && isOrgManagementRole(item.role)
  );
  if (!record) {
    throw new Error('حساب کاربری سازمانی یافت نشد.');
  }
  removeMockUser(id);
}
