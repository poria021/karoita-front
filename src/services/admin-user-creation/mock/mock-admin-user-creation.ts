import {
  mockMobileExists,
  readMockUsers,
  toPublicUser,
  writeMockUsers,
} from '@/services/auth/mock/mock-auth.store';
import type { MockAuthUserRecord } from '@/services/auth/mock/auth-mock-users';
import type {
  CreateOrganizationalUserInput,
  CreateOrganizationalUserResult,
  OrgAccountRole,
  StaffAdminAccount,
} from '@/types/admin-user-creation';
import { isStaffAdminRole } from '@/types/role-taxonomy';
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
