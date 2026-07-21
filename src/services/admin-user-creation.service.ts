import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import {
  mockMobileExists,
  readMockUsers,
  toPublicUser,
  writeMockUsers,
} from '@/services/auth/mock-auth.store';
import type { MockAuthUserRecord } from '@/services/mock/auth-mock-users';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import type {
  CreateOrganizationalUserInput,
  CreateOrganizationalUserResult,
  MobileAvailabilityResult,
  OrgAccountRole,
} from '@/types/admin-user-creation';
import { persianToEnglishDigits } from '@/utils/persianDigits';

/**
 * Facade ایجاد حساب‌های سازمانی (مدیر ارشد).
 *
 * MOCK → REAL swap map
 * - mock writeMockUsers / createOrganizationalUser  →  POST /admin/users (Nest)
 * - mockMobileExists / checkMobileAvailable         →  GET  /admin/users/mobile-availability?mobile=
 * - OrganizationOptionsService (در UI)              →  همان endpointهای org options (از قبل abstract)
 * - CreateOrganizationalUserInput فیلدها ثابت می‌مانند؛ فقط transport داخل این Facade عوض می‌شود
 */

function requireMockUserCreate(): void {
  if (!isMockApiMode()) {
    throwRealModeNotImplemented('AdminUserCreationService');
  }
  assertMockClientHasPermission('user.create');
}

function normalizeMobile(mobile: string): string {
  return persianToEnglishDigits(mobile).replace(/\D/g, '').slice(0, 10);
}

function buildOrgFields(
  role: OrgAccountRole,
  input: CreateOrganizationalUserInput
): Pick<
  MockAuthUserRecord,
  'province' | 'city' | 'college' | 'district' | 'school' | 'major'
> {
  const needsProvince =
    role === 'provincial_university' ||
    role === 'faculty_role' ||
    role === 'regional_edu_admin';

  return {
    province: needsProvince ? (input.province?.trim() ?? '') : '',
    city: role === 'regional_edu_admin' ? (input.city?.trim() ?? '') : '',
    college: role === 'faculty_role' ? (input.college?.trim() ?? '') : '',
    district:
      role === 'regional_edu_admin' ? (input.district?.trim() ?? '') : '',
    school: '',
    major: '',
  };
}

function mockCreateOrganizationalUser(
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
  if (password.length < 4) {
    throw new Error('رمز عبور باید حداقل ۴ کاراکتر باشد.');
  }

  const org = buildOrgFields(input.role, input);
  if (
    (input.role === 'provincial_university' ||
      input.role === 'faculty_role' ||
      input.role === 'regional_edu_admin') &&
    !org.province
  ) {
    throw new Error('انتخاب استان الزامی است.');
  }
  if (input.role === 'faculty_role' && !org.college) {
    throw new Error('انتخاب دانشکده / پردیس الزامی است.');
  }
  if (input.role === 'regional_edu_admin' && (!org.city || !org.district)) {
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

export const AdminUserCreationService = {
  async checkMobileAvailable(
    mobile: string
  ): Promise<MobileAvailabilityResult> {
    requireMockUserCreate();
    const normalized = normalizeMobile(mobile);
    if (!/^9\d{9}$/.test(normalized)) {
      return { available: true };
    }
    // REAL: GET /admin/users/mobile-availability?mobile=
    return { available: !mockMobileExists(normalized) };
  },

  async createOrganizationalUser(
    input: CreateOrganizationalUserInput
  ): Promise<CreateOrganizationalUserResult> {
    requireMockUserCreate();
    // REAL: POST /admin/users with CreateOrganizationalUserInput body
    return mockCreateOrganizationalUser(input);
  },
};
