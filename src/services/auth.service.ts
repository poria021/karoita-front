import {
  assertRealModeRejectsMockSecret,
  isMockApiMode,
  throwRealModeNotImplemented,
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
 * Real mode: Nest httpOnly cookies via `apiClient` (`credentials: 'include'`).
 * Zustand `activeUser` is UX chrome only — never authorization (rule 45 / ADR 004).
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
    throwRealModeNotImplemented('AuthService');
  }

  static async verifyLoginOtp(mobile: string, otp: string): Promise<User> {
    if (IS_MOCK_MODE) {
      return mockVerifyLoginOtp(mobile, otp);
    }
    rejectMockOtpInReal(otp);
    throwRealModeNotImplemented('AuthService');
  }

  /** Admin gate — only `super_admin`. OTP-only entry. */
  static async sendAdminGateOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) {
      mockSendAdminGateOtp(mobile);
      return;
    }
    throwRealModeNotImplemented('AuthService');
  }

  static async verifyAdminGateOtp(mobile: string, otp: string): Promise<User> {
    if (IS_MOCK_MODE) {
      return mockVerifyAdminGateOtp(mobile, otp);
    }
    rejectMockOtpInReal(otp);
    throwRealModeNotImplemented('AuthService');
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
    throwRealModeNotImplemented('AuthService');
  }

  static async sendForgotPasswordOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) {
      mockSendForgotPasswordOtp(mobile);
      return;
    }
    throwRealModeNotImplemented('AuthService');
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
    throwRealModeNotImplemented('AuthService');
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
    throwRealModeNotImplemented('AuthService');
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
    throwRealModeNotImplemented('AuthService');
  }

  static async logout(): Promise<void> {
    if (!IS_MOCK_MODE) {
      try {
        await realSignOut();
      } catch {
        // Real Nest sign-out not wired yet — still clear local session.
      }
    }
    dispatchSessionToStore(null);
  }

  /**
   * Idempotent session read for render — never clears cookies/store.
   * Prefer this (or {@link getSession}) inside React render paths.
   *
   * Real mode: returns Zustand chrome only (token empty). Nest httpOnly
   * session is authoritative — do not treat this as proof of privilege.
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

    // TODO(Nest): optional soft hint from last successful GET auth/session;
    // never invent a JS-readable Nest token here.
    return {
      user: activeUser,
      token: '',
      expiresAt: new Date(Date.now() + MOCK_SESSION_TTL_MS).toISOString(),
    };
  }

  /**
   * Validate session and clear expired/missing mock meta. Call only from
   * effects / event handlers — never during render (rule 45).
   *
   * Real mode: does not trust Zustand alone. Until Nest is wired, leaves
   * local chrome intact (logout / 401 interceptor clear the store). Prefer
   * `realFetchSession` from `real-auth.bridge` when Nest session lands.
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

    // TODO(Nest): await realFetchSession(); on null → dispatchSessionToStore(null).
    // Sync stub keeps peek semantics so guards do not forge Nest auth from Zustand.
    return AuthService.peekSession();
  }

  /** Render-safe alias of {@link peekSession}. */
  static getSession(): Session | null {
    return AuthService.peekSession();
  }
}
