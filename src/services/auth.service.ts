import {
  assertRealModeRejectsMockSecret,
  IS_MOCK_MODE,
  throwRealModeNotImplemented,
} from '@/lib/api-mode';
import {
  keepLocalIdentityPreview,
  retainSessionOrgFields,
} from '@/services/auth/keep-local-identity-preview';
import { MOCK_OTP_CODE } from '@/services/auth/mock/auth-mock-users';
import { DEFAULT_FORGOT_RETRY_AFTER_SECONDS } from '@/services/auth/real/parse-forgot-retry-after';
import type { Session, User, UserRole } from '@/types/auth';
import type { NestAuthUpdateDto } from '@/types/nest-users';
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
  mockUpdateMe,
  mockVerifyAdminGateOtp,
  mockVerifyLoginOtp,
  mockVerifyRegistrationOtp,
} from '@/services/auth/mock/mock-auth.operations';
import {
  dispatchSessionToStore,
  readSessionMeta,
} from '@/services/auth/mock/mock-auth.store';
import {
  realDeleteMe,
  realFetchSession,
  realLoginWithCredentials,
  realRegister,
  realResetPassword,
  realSendAdminGateOtp,
  realSendForgotPasswordOtp,
  realSendLoginOtp,
  realSignOut,
  realUpdateMe,
  realVerifyAdminGateOtp,
  realVerifyLoginOtp,
  realVerifyRegistrationOtp,
  realRefreshToken,
  type OtpCooldownResult,
} from '@/services/auth/real/real-auth.bridge';
import {
  clearRealAuthTokens,
  peekRealAuthTokens,
  readRealAccessToken,
  readRealTokenExpiresAt,
} from '@/services/auth/real/real-auth.tokens';

export interface RegisterPayload {
  mobile: string;
  role: UserRole;
}

function rejectMockOtpInReal(otp: string): void {
  assertRealModeRejectsMockSecret(otp, MOCK_OTP_CODE, 'OTP');
}

export class AuthService {
  static async loginWithCredentials(mobile: string, password: string): Promise<User> {
    if (IS_MOCK_MODE) return mockLoginWithCredentials(mobile, password);
    return realLoginWithCredentials(mobile, password);
  }

  static async sendLoginOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) { mockSendLoginOtp(mobile); return; }
    return realSendLoginOtp(mobile);
  }

  static async verifyLoginOtp(mobile: string, otp: string): Promise<User> {
    if (IS_MOCK_MODE) return mockVerifyLoginOtp(mobile, otp);
    rejectMockOtpInReal(otp);
    return realVerifyLoginOtp(mobile, otp);
  }

  static async sendAdminGateOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) { mockSendAdminGateOtp(mobile); return; }
    return realSendAdminGateOtp(mobile);
  }

  static async verifyAdminGateOtp(mobile: string, otp: string): Promise<User> {
    if (IS_MOCK_MODE) return mockVerifyAdminGateOtp(mobile, otp);
    rejectMockOtpInReal(otp);
    return realVerifyAdminGateOtp(mobile, otp);
  }

  static async register(payload: RegisterPayload): Promise<OtpCooldownResult> {
    if (IS_MOCK_MODE) {
      mockRegister(payload.mobile);
      return { retryAfterSeconds: DEFAULT_FORGOT_RETRY_AFTER_SECONDS };
    }
    return realRegister(payload.mobile, payload.role);
  }

  static async verifyRegistrationOtp(mobile: string, otp: string, role: UserRole): Promise<User> {
    if (IS_MOCK_MODE) return mockVerifyRegistrationOtp(mobile, otp, role);
    rejectMockOtpInReal(otp);
    return realVerifyRegistrationOtp(mobile, otp, role);
  }

  static async sendForgotPasswordOtp(
    mobile: string
  ): Promise<OtpCooldownResult> {
    if (IS_MOCK_MODE) {
      mockSendForgotPasswordOtp(mobile);
      return { retryAfterSeconds: DEFAULT_FORGOT_RETRY_AFTER_SECONDS };
    }
    return realSendForgotPasswordOtp(mobile);
  }

  static async resetPassword(mobile: string, otp: string, newPassword: string): Promise<void> {
    if (IS_MOCK_MODE) { mockResetPassword(mobile, otp, newPassword); return; }
    rejectMockOtpInReal(otp);
    return realResetPassword(mobile, otp, newPassword);
  }

  static async setInitialPassword(mobile: string, newPassword: string): Promise<void> {
    if (newPassword.trim().length < PASSWORD_MIN_LENGTH) throw new Error(PASSWORD_MIN_LENGTH_MESSAGE);
    if (IS_MOCK_MODE) { mockSetInitialPassword(mobile, newPassword); return; }
    await AuthService.updateMe({ password: newPassword });
  }

  static async updateMe(body: NestAuthUpdateDto): Promise<User> {
    const previous = useUserStore.getState().activeUser;
    const incoming = IS_MOCK_MODE
      ? mockUpdateMe(body)
      : await realUpdateMe(body);
    const user = keepLocalIdentityPreview(
      previous,
      retainSessionOrgFields(previous, incoming)
    );
    const peeked = AuthService.peekSession();
    if (peeked) dispatchSessionToStore({ ...peeked, user });
    return user;
  }

  static async deleteMe(): Promise<void> {
    if (IS_MOCK_MODE) throwRealModeNotImplemented('AuthService.deleteMe');
    await realDeleteMe();
    dispatchSessionToStore(null);
  }

  static async logout(): Promise<void> {
    if (!IS_MOCK_MODE) {
      try { await realSignOut(); } catch { /* realSignOut handles cleanup */ }
    }
    dispatchSessionToStore(null);
  }

  static peekSession(): Session | null {
    const activeUser = useUserStore.getState().activeUser;
    if (!activeUser) return null;

    if (IS_MOCK_MODE) {
      const meta = readSessionMeta();
      if (!meta) return null;
      if (new Date(meta.expiresAt).getTime() <= Date.now()) return null;
      return { user: activeUser, token: meta.token, expiresAt: meta.expiresAt };
    }

    const stored = peekRealAuthTokens();
    if (!stored) return null;
    const token = readRealAccessToken() ?? stored.token;
    const expiresAt = readRealTokenExpiresAt();
    if (!expiresAt) return null;
    return { user: activeUser, token, expiresAt };
  }

  /** فقط mock — بررسی انقضای session و پاک‌کردن store در صورت نیاز. */
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

    // real mode: فقط memory چک کن — cookie را دست نزن
    return AuthService.peekSession();
  }

  /**
   * یک بار /api/auth/refresh می‌زند (httpOnly cookie).
   * در صورت 401، clearRealAuthTokens صدا نمی‌زنیم اینجا —
   * caller مسئول تصمیم‌گیری است.
   */
  static async refreshAccessToken(): Promise<Session | null> {
    if (IS_MOCK_MODE) return AuthService.peekSession();
    return realRefreshToken();
  }

  /**
   * session کامل را بازسازی می‌کند:
   * ۱. اگر access token در memory هست → مستقیم /auth/me
   * ۲. اگر نه → یک‌بار /api/auth/refresh (httpOnly cookie) — این خودش در صورت
   *    نیاز /auth/me را می‌زند و نتیجه را به store دیسپچ می‌کند؛ اینجا دیگر
   *    دوباره /auth/me صدا زده نمی‌شود (قبلاً همیشه دوبار زده می‌شد).
   * ۳. اگر refresh هم fail شد → tokens/store پاک می‌شود و null برمی‌گردد
   */
  static async refreshRealSession(): Promise<Session | null> {
    if (IS_MOCK_MODE) return AuthService.peekSession();

    // اگر access token داریم مستقیم session fetch کن (یک درخواست، بدون refresh)
    if (readRealAccessToken()) {
      const session = await realFetchSession();
      if (session) {
        dispatchSessionToStore(session);
      } else {
        // access token در memory بود ولی /auth/me آن را رد کرد — پاکسازی کامل
        clearRealAuthTokens();
        dispatchSessionToStore(null);
      }
      return session;
    }

    // access token نداریم — یک‌بار refresh بزن. realRefreshToken خودش نتیجه را
    // (چه از مسیر rotation ساده، چه با /auth/me برای بازسازی کامل user) به
    // store دیسپچ می‌کند — دیگر نیازی به فراخوانی دوبارهٔ /auth/me نیست.
    const refreshed = await realRefreshToken();
    if (!refreshed) {
      // کوکی منقضی یا وجود ندارد — store و tokens پاک کن
      clearRealAuthTokens();
      dispatchSessionToStore(null);
      return null;
    }

    return refreshed;
  }

  static getSession(): Session | null {
    return AuthService.peekSession();
  }

  static getMockOtpHint(): string | null {
    return IS_MOCK_MODE ? MOCK_OTP_CODE : null;
  }
}
