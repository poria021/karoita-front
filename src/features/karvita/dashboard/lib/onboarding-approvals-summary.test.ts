import { describe, expect, it } from 'vitest';

import type { OnboardingApprovalUser } from '@/types/onboarding-approvals';

import {
  buildOnboardingApprovalsSummary,
  buildOnboardingPieSegments,
  ONBOARDING_DASHBOARD_PENDING_LIMIT,
  sumOnboardingCounts,
  userInitials,
} from './onboarding-approvals-summary';

function pendingUser(id: string): OnboardingApprovalUser {
  return {
    id,
    firstName: 'علی',
    lastName: 'احمدی',
    fullName: 'علی احمدی',
    mobile: '09120000000',
    role: 'student',
    approved: false,
    docStatus: 'pending_admin',
  };
}

describe('onboarding-approvals-summary', () => {
  it('builds pie segments in pending → approved → rejected order', () => {
    const segments = buildOnboardingPieSegments({
      pending_admin: 4,
      approved: 12,
      rejected: 2,
    });
    expect(segments.map((s) => s.id)).toEqual([
      'pending_admin',
      'approved',
      'rejected',
    ]);
    expect(segments.map((s) => s.value)).toEqual([4, 12, 2]);
  });

  it('sums counts and caps pending preview at the dashboard limit', () => {
    const pending = Array.from({ length: 15 }, (_, i) =>
      pendingUser(`u-${i}`)
    );
    const summary = buildOnboardingApprovalsSummary({
      counts: { pending_admin: 15, approved: 40, rejected: 5 },
      pendingPreview: pending,
    });
    expect(sumOnboardingCounts(summary.counts)).toBe(60);
    expect(summary.total).toBe(60);
    expect(summary.pendingPreview).toHaveLength(
      ONBOARDING_DASHBOARD_PENDING_LIMIT
    );
  });

  it('builds Persian initials from full name', () => {
    expect(userInitials('مریم رضایی')).toBe('مر');
    expect(userInitials('سارا')).toBe('س');
    expect(userInitials('  ')).toBe('؟');
  });
});
