import { describe, expect, it } from 'vitest';

import {
  BACKEND_OTP_LENGTH,
  forgotOtpResetSchema,
  loginSchema,
  mobileSchema,
  otpSchema,
  registerSchema,
} from '@/features/shared/auth/schemas/auth.schema';
import {
  PASSWORD_LATIN_ONLY_HINT,
  PASSWORD_MIN_LENGTH,
} from '@/utils/passwordInput';

describe('auth schemas (Nest contract)', () => {
  it('normalizes Persian mobile digits and rejects a leading zero', () => {
    expect(mobileSchema.safeParse({ mobile: '۹۱۲۳۴۵۶۷۸۹' }).success).toBe(true);
    expect(mobileSchema.safeParse({ mobile: '09123456789' }).success).toBe(
      false
    );
    expect(mobileSchema.parse({ mobile: '۹۱۲۳۴۵۶۷۸۹' }).mobile).toBe(
      '9123456789'
    );
  });

  it('requires Nest OTP length of 5 and accepts Persian digits', () => {
    expect(BACKEND_OTP_LENGTH).toBe(5);
    expect(otpSchema.safeParse({ otp: '۱۲۳۴۵' }).success).toBe(true);
    expect(otpSchema.parse({ otp: '۱۲۳۴۵' }).otp).toBe('12345');
    expect(otpSchema.safeParse({ otp: '1234' }).success).toBe(false);
  });

  it('rejects Persian-script passwords and short passwords on login', () => {
    const short = loginSchema.safeParse({
      mobile: '9123456789',
      password: 'short7',
      remember: false,
    });
    expect(short.success).toBe(false);

    const persian = loginSchema.safeParse({
      mobile: '9123456789',
      password: 'رمزعبور۱۲۳۴',
      remember: false,
    });
    expect(persian.success).toBe(false);
    if (!persian.success) {
      expect(persian.error.issues.some((i) => i.message === PASSWORD_LATIN_ONLY_HINT)).toBe(
        true
      );
    }

    expect(
      loginSchema.safeParse({
        mobile: '9123456789',
        password: 'a'.repeat(PASSWORD_MIN_LENGTH),
        remember: true,
      }).success
    ).toBe(true);
  });

  it('requires matching passwords on forgot+OTP reset', () => {
    const mismatch = forgotOtpResetSchema.safeParse({
      otp: '12345',
      newPassword: 'Password1',
      confirmPassword: 'Password2',
    });
    expect(mismatch.success).toBe(false);

    expect(
      forgotOtpResetSchema.safeParse({
        otp: '12345',
        newPassword: 'Password1',
        confirmPassword: 'Password1',
      }).success
    ).toBe(true);
  });

  it('rejects staff roles on self-register', () => {
    expect(
      registerSchema.safeParse({ mobile: '9123456789', role: 'student' })
        .success
    ).toBe(true);
    expect(
      registerSchema.safeParse({ mobile: '9123456789', role: 'super_admin' })
        .success
    ).toBe(false);
  });
});
