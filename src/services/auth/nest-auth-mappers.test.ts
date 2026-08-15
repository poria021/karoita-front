import { describe, expect, it } from 'vitest';

import {
  extractNestLoginResponse,
  looksLikeNestLoginResponse,
  mapNestAuthUser,
} from '@/services/auth/nest-auth-mappers';

const nestUser = {
  id: 'user-1',
  phone: '9386951413',
  firstName: 'Ali',
  lastName: 'Karimi',
  role: { id: 'role-1', name: 'student' },
  documentStatus: 'PENDING',
};

describe('nest-auth-mappers', () => {
  it('maps Nest phone + RoleDto to FE mobile + UserRole', () => {
    const user = mapNestAuthUser(nestUser);
    expect(user.mobile).toBe('9386951413');
    expect(user.role).toBe('student');
    expect(user.docStatus).toBe('pending_admin');
    expect(user.firstName).toBe('Ali');
  });

  it('extracts LoginResponseDto tokens and session expiry', () => {
    const tokenExpires = Date.UTC(2030, 0, 1);
    const parsed = extractNestLoginResponse({
      token: 'access-token',
      refreshToken: 'refresh-token',
      tokenExpires,
      user: nestUser,
    });

    expect(parsed.tokens.token).toBe('access-token');
    expect(parsed.tokens.refreshToken).toBe('refresh-token');
    expect(parsed.user.mobile).toBe('9386951413');
    expect(parsed.expiresAt).toBe(new Date(tokenExpires).toISOString());
  });

  it('detects login-shaped payloads', () => {
    expect(
      looksLikeNestLoginResponse({
        token: 't',
        user: nestUser,
      })
    ).toBe(true);
    expect(looksLikeNestLoginResponse({ time: 120 })).toBe(false);
    expect(looksLikeNestLoginResponse(null)).toBe(false);
  });
});
