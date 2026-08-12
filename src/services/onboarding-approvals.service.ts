import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { delayMockAdminListPage } from '@/lib/mock-admin-list-delay';
import { subscribeMockAuthUsers } from '@/services/auth/mock-auth.store';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import {
  collectProvinces,
  listFilteredUsers,
  patchApprovalUser,
  requireExistingMockUser,
} from '@/services/onboarding-approvals/mock-onboarding-approvals';
import type {
  ListOnboardingApprovalsFilters,
  ListOnboardingApprovalsPage,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';
import {
  DEFAULT_PAGE_LIMIT,
  sliceOffsetLimitPage,
} from '@/utils/offset-limit-page';

const IS_MOCK_MODE = isMockApiMode();

export const ONBOARDING_APPROVALS_PAGE_SIZE = DEFAULT_PAGE_LIMIT;

function requireOnboardingReview(): void {
  if (!isMockApiMode()) {
    throwRealModeNotImplemented('OnboardingApprovalsService');
  }
  assertMockClientHasPermission('onboarding.review');
}

/**
 * Onboarding identity-doc approval queue.
 * Real mode fail-closed until Nest admin review routes land.
 *
 * Nest map:
 * - GET  /onboarding-approvals?status&province&query&offset&limit
 * - POST /onboarding-approvals/:userId/approve
 * - POST /onboarding-approvals/:userId/reject
 * - GET  /onboarding-approvals/provinces  (or embedded in list meta)
 */
export const OnboardingApprovalsService = {
  /** GET /onboarding-approvals — offset/limit page + province facet */
  async listPage(
    filters: ListOnboardingApprovalsFilters
  ): Promise<ListOnboardingApprovalsPage> {
    if (!IS_MOCK_MODE) {
      throwRealModeNotImplemented('OnboardingApprovalsService.listPage');
    }
    requireOnboardingReview();

    await delayMockAdminListPage();

    const all = listFilteredUsers(filters);
    const page = sliceOffsetLimitPage(
      all,
      filters.offset ?? 0,
      filters.limit ?? ONBOARDING_APPROVALS_PAGE_SIZE
    );

    return {
      ...page,
      provinces: collectProvinces(),
    };
  },

  /** POST /onboarding-approvals/:userId/approve */
  async approveIdentityDoc(userId: string): Promise<OnboardingApprovalUser> {
    if (!IS_MOCK_MODE) {
      throwRealModeNotImplemented('OnboardingApprovalsService.approveIdentityDoc');
    }
    requireOnboardingReview();
    requireExistingMockUser(userId);
    await new Promise((resolve) => setTimeout(resolve, 250));
    return patchApprovalUser(userId, {
      docStatus: 'approved',
      approved: true,
      adminRequestMessage: undefined,
    });
  },

  /** POST /onboarding-approvals/:userId/reject — body: { reason } */
  async rejectIdentityDoc(
    userId: string,
    reason: string
  ): Promise<OnboardingApprovalUser> {
    if (!IS_MOCK_MODE) {
      throwRealModeNotImplemented('OnboardingApprovalsService.rejectIdentityDoc');
    }
    requireOnboardingReview();
    const trimmed = reason.trim();
    if (!trimmed) {
      throw new Error(
        'لطفاً علت نقص یا عدم تایید مدارک را بنویسید یا انتخاب کنید.'
      );
    }
    requireExistingMockUser(userId);
    await new Promise((resolve) => setTimeout(resolve, 250));
    return patchApprovalUser(userId, {
      docStatus: 'rejected',
      approved: false,
      adminRequestMessage: trimmed,
    });
  },

  /** GET /onboarding-approvals/provinces — filter facet for the queue UI */
  async listProvinces(): Promise<string[]> {
    if (!IS_MOCK_MODE) {
      throwRealModeNotImplemented('OnboardingApprovalsService.listProvinces');
    }
    requireOnboardingReview();
    return collectProvinces();
  },

  /** Mock: auth-user store; real: no-op until Nest push/SSE */
  subscribeDirectoryChanges(listener: () => void): () => void {
    if (!isMockApiMode()) {
      return () => {};
    }
    return subscribeMockAuthUsers(listener);
  },
};
