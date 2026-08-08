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
  return {
    province: orgAccountRequiresProvince(role)
      ? (input.province?.trim() ?? '')
      : '',
    city: orgAccountRequiresCity(role) ? (input.city?.trim() ?? '') : '',
    college: orgAccountRequiresCollege(role)
      ? (input.college?.trim() ?? '')
      : '',
    district: orgAccountRequiresDistrict(role)
      ? (input.district?.trim() ?? '')
      : '',
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
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(PASSWORD_MIN_LENGTH_MESSAGE);
  }

  const org = buildOrgFields(input.role, input);
  if (orgAccountRequiresProvince(input.role) && !org.province) {
    throw new Error('انتخاب استان الزامی است.');
  }
  if (orgAccountRequiresCollege(input.role) && !org.college) {
    throw new Error('انتخاب دانشکده / پردیس الزامی است.');
  }
  if (
    (orgAccountRequiresCity(input.role) && !org.city) ||
    (orgAccountRequiresDistrict(input.role) && !org.district)
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

export const AdminUserCreationService = {
  /** GET /admin/users/mobile-availability?mobile= */
  async checkMobileAvailable(
    mobile: string
  ): Promise<MobileAvailabilityResult> {
    requireMockUserCreate();
    const normalized = normalizeMobile(mobile);
    if (!/^9\d{9}$/.test(normalized)) {
      return { available: true };
    }
    return { available: !mockMobileExists(normalized) };
  },

  /** POST /admin/users */
  async createOrganizationalUser(
    input: CreateOrganizationalUserInput
  ): Promise<CreateOrganizationalUserResult> {
    requireMockUserCreate();
    return mockCreateOrganizationalUser(input);
  },
};
