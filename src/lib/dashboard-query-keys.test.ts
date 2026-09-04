import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import {
  DASHBOARD_QUERY,
  invalidateAcademicTermConsumers,
  invalidateOrganizationDirectoryConsumers,
} from './dashboard-query-keys';

describe('invalidateAcademicTermConsumers', () => {
  it('marks capacity, daily-approvals, enrollment, and passing-score queries stale', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(DASHBOARD_QUERY.orgCapacitiesTerms('internship'), [
      { id: 'gone', title: 'old' },
    ]);
    queryClient.setQueryData(DASHBOARD_QUERY.dailyApprovalsTerms('internship'), [
      { id: 'gone', title: 'old' },
    ]);
    queryClient.setQueryData(
      [...DASHBOARD_QUERY.internshipEnrollment, 'u1', 'student', 1],
      { stale: true }
    );
    queryClient.setQueryData(DASHBOARD_QUERY.passingScoreThreshold, 70);

    await invalidateAcademicTermConsumers(queryClient);

    expect(
      queryClient.getQueryState(DASHBOARD_QUERY.orgCapacitiesTerms('internship'))
        ?.isInvalidated
    ).toBe(true);
    expect(
      queryClient.getQueryState(DASHBOARD_QUERY.dailyApprovalsTerms('internship'))
        ?.isInvalidated
    ).toBe(true);
    expect(
      queryClient.getQueryState([
        ...DASHBOARD_QUERY.internshipEnrollment,
        'u1',
        'student',
        1,
      ])?.isInvalidated
    ).toBe(true);
    expect(
      queryClient.getQueryState(DASHBOARD_QUERY.passingScoreThreshold)
        ?.isInvalidated
    ).toBe(true);
  });
});

describe('invalidateOrganizationDirectoryConsumers', () => {
  it('marks org typeahead and onboarding province queries stale', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      [...DASHBOARD_QUERY.orgOptions, 'province', '', '', '', ''],
      { pages: [] }
    );
    queryClient.setQueryData(DASHBOARD_QUERY.onboardingApprovalsProvinces, []);

    await invalidateOrganizationDirectoryConsumers(queryClient);

    expect(
      queryClient.getQueryState([
        ...DASHBOARD_QUERY.orgOptions,
        'province',
        '',
        '',
        '',
        '',
      ])?.isInvalidated
    ).toBe(true);
    expect(
      queryClient.getQueryState(DASHBOARD_QUERY.onboardingApprovalsProvinces)
        ?.isInvalidated
    ).toBe(true);
  });
});
