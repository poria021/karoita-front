import { describe, expect, it } from 'vitest';

import { dashboardListCacheKey } from '@/store/useDashboardModuleCache';

import {
  ONBOARDING_APPROVALS_CACHE_NAMESPACE,
  onboardingApprovalsListResetKey,
} from './onboardingApprovalsListKeys';

describe('onboardingApprovalsListResetKey', () => {
  it('scopes by tab, search, and province filter', () => {
    expect(
      onboardingApprovalsListResetKey('pending_admin', '', 'all')
    ).toBe('pending_admin::::all');
    expect(
      onboardingApprovalsListResetKey('approved', 'علی', 'اصفهان')
    ).toBe('approved::علی::اصفهان');
  });

  it('composes dashboard list cache keys like the page hook', () => {
    const resetKey = onboardingApprovalsListResetKey(
      'pending_admin',
      '',
      'all'
    );
    expect(
      dashboardListCacheKey(ONBOARDING_APPROVALS_CACHE_NAMESPACE, resetKey)
    ).toBe('onboarding-approvals::pending_admin::::all');
  });
});
