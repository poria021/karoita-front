import { assertMockApiMode } from '@/lib/api-mode';
import {
  MOCK_OTP_CODE,
  MOCK_USER_PASSWORD,
  type MockAuthUserRecord,
} from '@/services/auth/auth-mock-users';
import { useUserStore } from '@/store/useUserStore';
import type { User, UserRole } from '@/types/auth';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';

import {
  AUTH_ERR_ADMIN_GATE_ONLY,
  AUTH_ERR_PUBLIC_AUTH_ADMIN_BLOCKED,
  AUTH_ERR_USER_NOT_FOUND,
} from '@/services/auth/auth-error-messages';
import {
  buildMockSession,
  dispatchSessionToStore,
  findMockUserByMobile,
  mockMobileExists,
  readMockUsers,
  toPublicUser,
  writeMockUsers,
} from '@/services/auth/mock-auth.store';

export function assertMockOtp(otp: string): void {
  assertMockApiMode();
  if (otp !== MOCK_OTP_CODE) {
    throw new Error(
      'کد تایید نادرست است. (شبیه‌ساز محلی mock — این کد OTP سرور Nest نیست.)'
    );
  }
}

function requireUserByMobile(mobile: string): MockAuthUserRecord {
  const record = findMockUserByMobile(mobile);
  if (!record) {
    throw new Error(AUTH_ERR_USER_NOT_FOUND);
  }
  return record;
}

export function assertPublicAuthAudience(record: MockAuthUserRecord): void {
  if (isSuperAdminRole(record.role)) {
    throw new Error(AUTH_ERR_PUBLIC_AUTH_ADMIN_BLOCKED);
  }
}

function requirePublicUserByMobile(mobile: string): MockAuthUserRecord {
  const record = requireUserByMobile(mobile);
  assertPublicAuthAudience(record);
  return record;
}

function updateUserPassword(mobile: string, newPassword: string): void {
  const users = readMockUsers();
  const current = findMockUserByMobile(mobile);
  if (!current) {
    throw new Error(AUTH_ERR_USER_NOT_FOUND);
  }
  const updatedUsers = users.map((candidate) =>
    candidate.mobile === mobile
      ? { ...candidate, password: newPassword, hasPassword: true }
      : candidate
  );
  writeMockUsers(updatedUsers);

  const activeUser = useUserStore.getState().activeUser;
  if (activeUser?.mobile === mobile) {
    useUserStore.getState().setUser({ ...activeUser, hasPassword: true });
  }
}

export function mockLoginWithCredentials(
  mobile: string,
  password: string
): User {
  const record = requirePublicUserByMobile(mobile);
  if (record.password !== password) {
    throw new Error('شماره موبایل یا رمز عبور اشتباه است.');
  }
  const user = toPublicUser(record);
  dispatchSessionToStore(buildMockSession(user));
  return user;
}

export function mockSendLoginOtp(mobile: string): void {
  requirePublicUserByMobile(mobile);
}

export function mockVerifyLoginOtp(mobile: string, otp: string): User {
  assertMockOtp(otp);
  const user = toPublicUser(requirePublicUserByMobile(mobile));
  dispatchSessionToStore(buildMockSession(user));
  return user;
}

export function mockSendAdminGateOtp(mobile: string): void {
  const record = findMockUserByMobile(mobile);
  if (!record || !isSuperAdminRole(record.role)) {
    throw new Error(AUTH_ERR_ADMIN_GATE_ONLY);
  }
}

export function mockVerifyAdminGateOtp(mobile: string, otp: string): User {
  assertMockOtp(otp);
  const record = findMockUserByMobile(mobile);
  if (!record || !isSuperAdminRole(record.role)) {
    throw new Error(AUTH_ERR_ADMIN_GATE_ONLY);
  }
  const user = toPublicUser(record);
  dispatchSessionToStore(buildMockSession(user));
  return user;
}

export function mockRegister(mobile: string): void {
  if (mockMobileExists(mobile)) {
    throw new Error('کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است.');
  }
}

export function mockVerifyRegistrationOtp(
  mobile: string,
  otp: string,
  role: UserRole
): User {
  assertMockOtp(otp);
  if (isSuperAdminRole(role)) {
    throw new Error(AUTH_ERR_PUBLIC_AUTH_ADMIN_BLOCKED);
  }
  const users = readMockUsers();
  const newRecord: MockAuthUserRecord = {
    id: `#U-${Date.now()}`,
    firstName: '',
    lastName: '',
    mobile,
    role,
    approved: false,
    docStatus: 'not_submitted',
    password: MOCK_USER_PASSWORD,
    hasPassword: false,
  };
  writeMockUsers([...users, newRecord]);
  const user = toPublicUser(newRecord);
  dispatchSessionToStore(buildMockSession(user));
  return user;
}

export function mockSendForgotPasswordOtp(mobile: string): void {
  requirePublicUserByMobile(mobile);
}

export function mockVerifyForgotPasswordOtp(mobile: string, otp: string): void {
  assertMockOtp(otp);
  requirePublicUserByMobile(mobile);
}

export function mockResetPassword(
  mobile: string,
  otp: string,
  newPassword: string
): void {
  assertMockOtp(otp);
  requirePublicUserByMobile(mobile);
  updateUserPassword(mobile, newPassword);
}

export function mockSetInitialPassword(
  mobile: string,
  newPassword: string
): void {
  updateUserPassword(mobile, newPassword);
}
