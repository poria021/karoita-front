import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AUTH_MOCK_USERS } from '@/services/auth/auth-mock-users';
import {
  findMockUserById,
  resetMockAuthStoreForTests,
  toPublicUser,
} from '@/services/auth/mock-auth.store';
import { ProfileService } from '@/services/profile.service';
import { useUserStore } from '@/store/useUserStore';

describe('ProfileService mock persistence', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'development');
    resetMockAuthStoreForTests(AUTH_MOCK_USERS.map((u) => ({ ...u })));
    useUserStore.setState({ activeUser: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetMockAuthStoreForTests();
  });

  it('updateOnboardingProfile patches auth store and syncs Zustand', async () => {
    const seed = AUTH_MOCK_USERS.find((u) => u.role === 'student');
    expect(seed).toBeTruthy();
    if (!seed) return;

    useUserStore.getState().setUser(toPublicUser(seed));

    const updated = await ProfileService.updateOnboardingProfile({
      role: 'student',
      firstName: 'تست',
      lastName: 'پروفایل',
      province: seed.province ?? ['تهران'],
      college: seed.college ?? ['پردیس'],
      major: seed.major ?? 'آموزش',
      studentId: seed.studentId ?? '140210345',
    });

    expect(updated.firstName).toBe('تست');
    expect(findMockUserById(seed.id)?.firstName).toBe('تست');
    expect(useUserStore.getState().activeUser?.firstName).toBe('تست');
    expect(updated.docStatus).toBe('pending_admin');
  });

  it('updateProfile portal path uses the same mock writer', async () => {
    const seed = AUTH_MOCK_USERS.find((u) => u.role === 'super_admin');
    expect(seed).toBeTruthy();
    if (!seed) return;

    useUserStore.getState().setUser(toPublicUser(seed));

    const result = await ProfileService.updateProfile(
      {
        role: 'super_admin',
        firstName: 'ادمین',
        lastName: 'سیستم',
      },
      `mock.${seed.id}.1`
    );

    expect(result.success).toBe(true);
    expect(findMockUserById(seed.id)?.firstName).toBe('ادمین');
    expect(useUserStore.getState().activeUser?.approved).toBe(true);
    expect(useUserStore.getState().activeUser?.docStatus).toBe('approved');
  });

  it('updateIdentityDocument persists docUrl for admin review', async () => {
    const seed = AUTH_MOCK_USERS.find((u) => u.role === 'student');
    expect(seed).toBeTruthy();
    if (!seed) return;

    useUserStore.getState().setUser(toPublicUser(seed));
    const dataUrl =
      'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';

    await ProfileService.updateIdentityDocument(dataUrl, `mock.${seed.id}.1`);

    const stored = findMockUserById(seed.id);
    expect(stored?.docUrl).toBe(dataUrl);
    expect(stored?.docType).toBe('webp');
    expect(stored?.docStatus).toBe('pending_admin');
    expect(useUserStore.getState().activeUser?.docUrl).toBe(dataUrl);
  });
});
