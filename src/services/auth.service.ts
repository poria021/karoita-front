import {
  assertRealModeRejectsMockSecret,
  isMockApiMode,
} from '@/lib/api-mode';
import { MOCK_OTP_CODE } from '@/services/auth/auth-mock-users';
import type { Session, User, UserRole } from '@/types/auth';
import { useUserStore } from '@/store/useUserStore';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
} from '@/utils/passwordInput';

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
  realResetPassword,
  realSendAdminGateOtp,
  realSendForgotPasswordOtp,
  realSendLoginOtp,
  realSetInitialPassword,
  realSignOut,
  realVerifyAdminGateOtp,
  realVerifyForgotPasswordOtp,
  realVerifyLoginOtp,
  realVerifyRegistrationOtp,
} from '@/services/auth/real-auth.bridge';


const IS_MOCK_MODE = isMockApiMode();

export interface RegisterPayload {
  mobile: string;
  role: UserRole;
}

function rejectMockOtpInReal(otp: string): void {
  assertRealModeRejectsMockSecret(otp, MOCK_OTP_CODE, 'OTP');
}

/**
 * Auth facade — login, OTP, registration, session.
 * UI talks only here; mock vs Nest is swapped inside (see real-auth.bridge).
 *
 * Nest map (via REAL_AUTH_PATHS):
 * - POST /auth/login
 * - POST /auth/otp/login/send|verify
 * - POST /auth/admin/otp/send|verify
 * - POST /auth/register + /auth/otp/register/verify
 * - POST /auth/password/forgot/* + /auth/password/initial
 * - POST /auth/logout · GET /auth/session
 */
export class AuthService {
  /** POST /auth/login */
  static async loginWithCredentials(
    mobile: string,
    password: string
  ): Promise<User> {
    if (IS_MOCK_MODE) {
      return mockLoginWithCredentials(mobile, password);
    }
    return realLoginWithCredentials(mobile, password);
  }

  /** POST /auth/otp/login/send */
  static async sendLoginOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) {
      mockSendLoginOtp(mobile);
      return;
    }
    return realSendLoginOtp(mobile);
  }

  /** POST /auth/otp/login/verify */
  static async verifyLoginOtp(mobile: string, otp: string): Promise<User> {
    if (IS_MOCK_MODE) {
      return mockVerifyLoginOtp(mobile, otp);
    }
    rejectMockOtpInReal(otp);
    return realVerifyLoginOtp(mobile, otp);
  }

  /** POST /auth/admin/otp/send */
  static async sendAdminGateOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) {
      mockSendAdminGateOtp(mobile);
      return;
    }
    return realSendAdminGateOtp(mobile);
  }

  /** POST /auth/admin/otp/verify */
  static async verifyAdminGateOtp(mobile: string, otp: string): Promise<User> {
    if (IS_MOCK_MODE) {
      return mockVerifyAdminGateOtp(mobile, otp);
    }
    rejectMockOtpInReal(otp);
    return realVerifyAdminGateOtp(mobile, otp);
  }

  /** POST /auth/register */
  static async register(payload: RegisterPayload): Promise<void> {
    if (IS_MOCK_MODE) {
      mockRegister(payload.mobile);
      return;
    }
    await realRegister(payload.mobile);
  }

  /** POST /auth/otp/register/verify */
  static async verifyRegistrationOtp(
    mobile: string,
    otp: string,
    role: UserRole
  ): Promise<User> {
    if (IS_MOCK_MODE) {
      return mockVerifyRegistrationOtp(mobile, otp, role);
    }
    rejectMockOtpInReal(otp);
    return realVerifyRegistrationOtp(mobile, otp, role);
  }

  /** POST /auth/password/forgot/send */
  static async sendForgotPasswordOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) {
      mockSendForgotPasswordOtp(mobile);
      return;
    }
    return realSendForgotPasswordOtp(mobile);
  }

  /** POST /auth/password/forgot/verify */
  static async verifyForgotPasswordOtp(
    mobile: string,
    otp: string
  ): Promise<void> {
    if (IS_MOCK_MODE) {
      mockVerifyForgotPasswordOtp(mobile, otp);
      return;
    }
    rejectMockOtpInReal(otp);
    return realVerifyForgotPasswordOtp(mobile, otp);
  }

  /** POST /auth/password/forgot/reset */
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
    return realResetPassword(mobile, otp, newPassword);
  }

  /** POST /auth/password/initial */
  static async setInitialPassword(
    mobile: string,
    newPassword: string
  ): Promise<void> {
    if (newPassword.trim().length < PASSWORD_MIN_LENGTH) {
      throw new Error(PASSWORD_MIN_LENGTH_MESSAGE);
    }
    if (IS_MOCK_MODE) {
      mockSetInitialPassword(mobile, newPassword);
      return;
    }
    return realSetInitialPassword(mobile, newPassword);
  }

  /** POST /auth/logout — clears local session even if Nest call fails */
  static async logout(): Promise<void> {
    if (!IS_MOCK_MODE) {
      try {
        await realSignOut();
      } catch {}
    }
    dispatchSessionToStore(null);
  }

  /** Read-only session peek — no cookie/store side-effects during render */
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

  /** Clears expired mock session; call from effects, not during render */
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

  static getSession(): Session | null {
    return AuthService.peekSession();
  }

  /** DX-only mock OTP; real mode always null — never treat as auth */
  static getMockOtpHint(): string | null {
    return IS_MOCK_MODE ? MOCK_OTP_CODE : null;
  }
}
