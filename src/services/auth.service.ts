import {
  assertRealModeRejectsMockSecret,
  isMockApiMode,
  REAL_MODE_NOT_IMPLEMENTED,
} from '@/lib/api-mode';
import { MOCK_OTP_CODE } from '@/services/mock/auth-mock-users';
import type { Session, User, UserRole } from '@/types/auth';
import { useUserStore } from '@/store/useUserStore';

import {
  mockLoginWithCredentials,
  mockRegister,
  mockResetPassword,
  mockSendAdminGateOtp,
  mockSendForgotPasswordOtp,
  mockSendLoginOtp,
  mockSetInitialPassword,
  mockVerifyAdminGateOtp,
  mockVerifyForgotPasswordOtp,
  mockVerifyLoginOtp,
  mockVerifyRegistrationOtp,
} from '@/services/auth/mock-auth.operations';
import {
  dispatchSessionToStore,
  MOCK_SESSION_TTL_MS,
  readSessionMeta,
} from '@/services/auth/mock-auth.store';
import {
  realLoginWithCredentials,
  realRegister,
  realSignOut,
} from '@/services/auth/real-auth.bridge';

/**
 * Facade for every authentication interaction (rule 40).
 * Mock session meta stays JS-readable for local DX only — NOT Nest auth.
 * Real mode relies on Better-Auth / Nest httpOnly cookies — no token in JS cookies.
 */

const IS_MOCK_MODE = isMockApiMode();

export interface RegisterPayload {
  mobile: string;
  role: UserRole;
}

function rejectMockOtpInReal(otp: string): void {
  assertRealModeRejectsMockSecret(otp, MOCK_OTP_CODE, 'OTP');
}

export class AuthService {
  static async loginWithCredentials(
    mobile: string,
    password: string
  ): Promise<User> {
    if (IS_MOCK_MODE) {
      return mockLoginWithCredentials(mobile, password);
    }
    return realLoginWithCredentials(mobile, password);
  }

  static async sendLoginOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) {
      mockSendLoginOtp(mobile);
      return;
    }
    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async verifyLoginOtp(mobile: string, otp: string): Promise<User> {
    if (IS_MOCK_MODE) {
      return mockVerifyLoginOtp(mobile, otp);
    }
    rejectMockOtpInReal(otp);
    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  /** Admin gate — only `super_admin`. OTP-only entry. */
  static async sendAdminGateOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) {
      mockSendAdminGateOtp(mobile);
      return;
    }
    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async verifyAdminGateOtp(mobile: string, otp: string): Promise<User> {
    if (IS_MOCK_MODE) {
      return mockVerifyAdminGateOtp(mobile, otp);
    }
    rejectMockOtpInReal(otp);
    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async register(payload: RegisterPayload): Promise<void> {
    if (IS_MOCK_MODE) {
      mockRegister(payload.mobile);
      return;
    }
    await realRegister(payload.mobile);
  }

  static async verifyRegistrationOtp(
    mobile: string,
    otp: string,
    role: UserRole
  ): Promise<User> {
    if (IS_MOCK_MODE) {
      return mockVerifyRegistrationOtp(mobile, otp, role);
    }
    rejectMockOtpInReal(otp);
    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async sendForgotPasswordOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) {
      mockSendForgotPasswordOtp(mobile);
      return;
    }
    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async verifyForgotPasswordOtp(
    mobile: string,
    otp: string
  ): Promise<void> {
    if (IS_MOCK_MODE) {
      mockVerifyForgotPasswordOtp(mobile, otp);
      return;
    }
    rejectMockOtpInReal(otp);
    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async resetPassword(
    mobile: string,
    otp: string,
    newPassword: string
  ): Promise<void> {
    if (IS_MOCK_MODE) {
      mockResetPassword(mobile, otp, newPassword);
      return;
    }
    rejectMockOtpInReal(otp);
    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async setInitialPassword(
    mobile: string,
    newPassword: string
  ): Promise<void> {
    if (newPassword.trim().length < 8) {
      throw new Error('رمز عبور باید حداقل ۸ کاراکتر باشد.');
    }
    if (IS_MOCK_MODE) {
      mockSetInitialPassword(mobile, newPassword);
      return;
    }
    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async logout(): Promise<void> {
    if (!IS_MOCK_MODE) {
      await realSignOut();
    }
    dispatchSessionToStore(null);
  }

  /**
   * Idempotent session read for render — never clears cookies/store.
   * Prefer this (or {@link getSession}) inside React render paths.
   */
  static peekSession(): Session | null {
    const activeUser = useUserStore.getState().activeUser;
    if (!activeUser) return null;

    if (IS_MOCK_MODE) {
      const meta = readSessionMeta();
      if (!meta) return null;
      if (new Date(meta.expiresAt).getTime() <= Date.now()) return null;
      return { user: activeUser, token: meta.token, expiresAt: meta.expiresAt };
    }

    return {
      user: activeUser,
      token: '',
      expiresAt: new Date(Date.now() + MOCK_SESSION_TTL_MS).toISOString(),
    };
  }

  /**
   * Validate session and clear expired/missing mock meta. Call only from
   * effects / event handlers — never during render (rule 45).
   */
  static validateSession(): Session | null {
    const activeUser = useUserStore.getState().activeUser;
    if (!activeUser) return null;

    if (IS_MOCK_MODE) {
      const meta = readSessionMeta();
      if (!meta || new Date(meta.expiresAt).getTime() <= Date.now()) {
        dispatchSessionToStore(null);
        return null;
      }
      return { user: activeUser, token: meta.token, expiresAt: meta.expiresAt };
    }

    return AuthService.peekSession();
  }

  /** Render-safe alias of {@link peekSession}. */
  static getSession(): Session | null {
    return AuthService.peekSession();
  }
}
