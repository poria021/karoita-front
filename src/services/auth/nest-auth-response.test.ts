import { describe, expect, it } from 'vitest';

import {
  extractNestLoginResponse,
  extractNestMeUser,
  mapNestAuthUser,
  nestPhoneToMobile,
  nestTokenExpiresAt,
  sessionFromNestLogin,
} from '@/services/auth/nest-auth-response';

describe('nest-auth-response', () => {
  it('normalizes Nest phone shapes to FE mobile', () => {
    expect(nestPhoneToMobile('9386951413')).toBe('9386951413');
    expect(nestPhoneToMobile('09386951413')).toBe('9386951413');
    expect(nestPhoneToMobile('989386951413')).toBe('9386951413');
  });

  it('maps Nest user phone + role object to FE User', () => {
    const user = mapNestAuthUser({
      id: 'u1',
      phone: '09386951413',
      firstName: 'Ali',
      lastName: 'Karimi',
      role: { id: 'r1', name: 'trainee' },
      documentStatus: 'PENDING',
      status: { id: '1', name: 'active' },
    });

    expect(user).toMatchObject({
      id: 'u1',
      mobile: '9386951413',
      role: 'skill_learner',
      firstName: 'Ali',
      lastName: 'Karimi',
      approved: true,
      docStatus: 'pending_admin',
    });
  });

  it('parses LoginResponseDto into Session fields', () => {
    const expires = Date.now() + 3_600_000;
    const session = sessionFromNestLogin({
      token: 'access-token',
      refreshToken: 'refresh-token',
      tokenExpires: expires,
      user: {
        id: 'u1',
        phone: '9386951413',
        role: { id: 'r1', name: 'student' },
      },
    });

    expect(session.token).toBe('access-token');
    expect(session.refreshToken).toBe('refresh-token');
    expect(session.user.role).toBe('student');
    expect(session.expiresAt).toBe(new Date(expires).toISOString());
  });

  it('reads GET /me user payload without login wrapper', () => {
    const user = extractNestMeUser({
      id: 'u2',
      phone: '9123456789',
      role: { id: 'r2', name: 'teacher' },
      documentStatus: 'CONFIRM',
    });
    expect(user.role).toBe('mentor_teacher');
    expect(user.docStatus).toBe('approved');
  });

  it('rejects login payload without token', () => {
    expect(() =>
      extractNestLoginResponse({
        tokenExpires: Date.now(),
        user: { id: 'u1', phone: '9386951413', role: { name: 'student' } },
      })
    ).toThrow(/توکن/);
  });

  it('treats small tokenExpires as TTL milliseconds', () => {
    const before = Date.now();
    const iso = nestTokenExpiresAt(120_000);
    const at = new Date(iso).getTime();
    expect(at).toBeGreaterThanOrEqual(before + 120_000);
  });
});
