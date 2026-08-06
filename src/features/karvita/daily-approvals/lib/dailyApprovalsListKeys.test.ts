import { describe, expect, it } from 'vitest';

import { dashboardListCacheKey } from '@/store/useDashboardModuleCache';

import {
  DAILY_APPROVALS_CACHE_NAMESPACE,
  dailyApprovalsListResetKey,
} from './dailyApprovalsListKeys';

describe('daily approvals list contracts', () => {
  it('scopes paging cache by kind, read filter, course, term, and query', () => {
    const resetKey = dailyApprovalsListResetKey(
      'internship',
      'unread',
      'intern1',
      'term_2',
      'مریم'
    );

    expect(resetKey).toBe('internship::unread::intern1::term_2::مریم');
    expect(
      dashboardListCacheKey(DAILY_APPROVALS_CACHE_NAMESPACE, resetKey)
    ).toBe('daily-approvals::internship::unread::intern1::term_2::مریم');
  });
});
