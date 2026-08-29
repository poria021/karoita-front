import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('AuthService real mode', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('never exposes the mock OTP hint and rejects the mock OTP on verify', async () => {
    const { AuthService } = await import('@/services/auth.service');
    const { MOCK_OTP_CODE } = await import(
      '@/services/auth/mock/auth-mock-users'
    );

    expect(AuthService.getMockOtpHint()).toBeNull();
    await expect(
      AuthService.verifyLoginOtp('9123456789', MOCK_OTP_CODE)
    ).rejects.toThrow(/real/);
    await expect(
      AuthService.verifyAdminGateOtp('9123456789', MOCK_OTP_CODE)
    ).rejects.toThrow(/real/);
    await expect(
      AuthService.resetPassword('9123456789', MOCK_OTP_CODE, 'Password1')
    ).rejects.toThrow(/real/);
  });
});
