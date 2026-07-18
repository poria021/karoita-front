import { assertMockApiMode } from '@/lib/api-mode';
import {
  MOCK_OTP_CODE,
  MOCK_USER_PASSWORD,
  type MockAuthUserRecord,
} from '@/services/mock/auth-mock-users';
import { useUserStore } from '@/store/useUserStore';
import type { User, UserRole } from '@/types/auth';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';

import {
  buildMockSession,
  dispatchSessionToStore,
  findMockUserByMobile,
  mockMobileExists,
  readMockUsers,
  toPublicUser,
  writeMockUsers,
} from '@/services/auth/mock-auth.store';

/** Accepts {@link MOCK_OTP_CODE} only inside mock simulator — never in real. */
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
    throw new Error('کاربری با این شماره یافت نشد.');
  }
  return record;
}

function updateUserPassword(mobile: string, newPassword: string): void {
  const users = readMockUsers();
  const current = findMockUserByMobile(mobile);
  if (!current) {
    throw new Error('کاربری با این شماره یافت نشد.');
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
  const record = requireUserByMobile(mobile);
  if (record.password !== password) {
    throw new Error('شماره موبایل یا رمز عبور اشتباه است.');
  }
  const user = toPublicUser(record);
  dispatchSessionToStore(buildMockSession(user));
  return user;
}

export function mockSendLoginOtp(mobile: string): void {
  requireUserByMobile(mobile);
}

export function mockVerifyLoginOtp(mobile: string, otp: string): User {
  assertMockOtp(otp);
  const user = toPublicUser(requireUserByMobile(mobile));
  dispatchSessionToStore(buildMockSession(user));
  return user;
}

export function mockSendAdminGateOtp(mobile: string): void {
  const record = findMockUserByMobile(mobile);
  if (!record || !isSuperAdminRole(record.role)) {
    throw new Error('دسترسی این درگاه فقط برای مدیریت ارشد سامانه است.');
  }
}

export function mockVerifyAdminGateOtp(mobile: string, otp: string): User {
  assertMockOtp(otp);
  const record = findMockUserByMobile(mobile);
  if (!record || !isSuperAdminRole(record.role)) {
    throw new Error('دسترسی این درگاه فقط برای مدیریت ارشد سامانه است.');
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
  requireUserByMobile(mobile);
}

export function mockVerifyForgotPasswordOtp(mobile: string, otp: string): void {
  assertMockOtp(otp);
  requireUserByMobile(mobile);
}

export function mockResetPassword(
  mobile: string,
  otp: string,
  newPassword: string
): void {
  assertMockOtp(otp);
  updateUserPassword(mobile, newPassword);
}

export function mockSetInitialPassword(
  mobile: string,
  newPassword: string
): void {
  updateUserPassword(mobile, newPassword);
}
