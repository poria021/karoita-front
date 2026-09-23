import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '@/services/auth.service';
import { SessionTransientError } from '@/services/auth/session-errors';

describe('AuthService.restoreBootSession (real)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('refresh موفق → authenticated', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.spyOn(AuthService, 'peekSession').mockReturnValue(null);
    vi.spyOn(AuthService, 'refreshRealSession').mockResolvedValue({
      token: 't',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      user: { id: 'u1' },
    } as never);

    await expect(AuthService.restoreBootSession()).resolves.toBe(
      'authenticated'
    );
  });

  it('refresh مرده → unauthenticated', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.spyOn(AuthService, 'peekSession').mockReturnValue(null);
    vi.spyOn(AuthService, 'refreshRealSession').mockResolvedValue(null);

    await expect(AuthService.restoreBootSession()).resolves.toBe(
      'unauthenticated'
    );
  });

  it('refresh گذرا → error', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.spyOn(AuthService, 'peekSession').mockReturnValue(null);
    vi.spyOn(AuthService, 'refreshRealSession').mockRejectedValue(
      new SessionTransientError('سرور در دسترس نیست')
    );

    await expect(AuthService.restoreBootSession()).resolves.toBe('error');
  });
});
