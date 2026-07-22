import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockVerifyRegistrationOtp } from '@/services/auth/mock-auth.operations';
import {
  findMockUserById,
  resetMockAuthStoreForTests,
  toPublicUser,
} from '@/services/auth/mock-auth.store';
import { AUTH_MOCK_USERS } from '@/services/mock/auth-mock-users';
import { OnboardingApprovalsService } from '@/services/onboarding-approvals.service';
import { ProfileService } from '@/services/profile.service';
import { useUserStore } from '@/store/useUserStore';

describe('OnboardingApprovalsService mock — register then profile', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'development');
    vi.useFakeTimers({ shouldAdvanceTime: true });
    resetMockAuthStoreForTests(AUTH_MOCK_USERS.map((u) => ({ ...u })));
    useUserStore.setState({ activeUser: null });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    resetMockAuthStoreForTests();
  });

  it('shows a newly registered user in pending_admin after profile submit', async () => {
    const mobile = '9125557788';
    const registered = mockVerifyRegistrationOtp(mobile, '12345', 'student');
    expect(registered.docStatus).toBe('not_submitted');

    useUserStore.getState().setUser(registered);

    const updated = await ProfileService.updateOnboardingProfile({
      role: 'student',
      firstName: 'کاربر',
      lastName: 'تازه‌وارد',
      province: 'تهران',
      college: 'پردیس مرکزی',
      major: 'آموزش ابتدایی',
      studentId: '140299001',
    });

    expect(updated.docStatus).toBe('pending_admin');
    expect(findMockUserById(registered.id)?.docStatus).toBe('pending_admin');

    const admin = AUTH_MOCK_USERS.find((u) => u.role === 'super_admin');
    expect(admin).toBeTruthy();
    if (!admin) return;
    useUserStore.getState().setUser(toPublicUser(admin));

    const page = await OnboardingApprovalsService.listPage({
      status: 'pending_admin',
      query: mobile,
      province: 'all',
      offset: 0,
      limit: 10,
    });

    expect(page.items.some((user) => user.id === registered.id)).toBe(true);
    expect(page.items[0]?.id).toBe(registered.id);
  });
});
