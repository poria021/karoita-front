import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import {
  findMockUserById,
  patchMockAuthUser,
  readMockUsers,
  toPublicUser,
} from '@/services/auth/mock-auth.store';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import type { User } from '@/types/auth';
import type {
  ListOnboardingApprovalsFilters,
  ListOnboardingApprovalsPage,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';
import {
  DEFAULT_PAGE_LIMIT,
  sliceOffsetLimitPage,
} from '@/utils/offset-limit-page';
import { persianToEnglishDigits } from '@/utils/persianDigits';

/**
 * Facade for identity-document onboarding review (rule 40).
 * Mock: mutates `karvita_mock_auth_users` + syncs Zustand if the target is
 * the active session. Real: Nest must authorize `onboarding.review`.
 */

const IS_MOCK_MODE = isMockApiMode();

/** Nest-aligned page size for admin tables (same as org-structure). */
export const ONBOARDING_APPROVALS_PAGE_SIZE = DEFAULT_PAGE_LIMIT;

function requireOnboardingReview(): void {
  if (!isMockApiMode()) {
    throwRealModeNotImplemented('OnboardingApprovalsService');
  }
  assertMockClientHasPermission('onboarding.review');
}

function toApprovalUser(user: User): OnboardingApprovalUser {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return {
    ...user,
    fullName: fullName || 'ثبت‌نشده',
  };
}

function matchesQuery(user: User, rawQuery: string): boolean {
  const q = persianToEnglishDigits(rawQuery).trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    user.firstName,
    user.lastName,
    `${user.firstName} ${user.lastName}`,
    user.id,
    user.mobile,
    user.personalCode,
    user.studentId,
    user.skillCode,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

function listFilteredUsers(
  filters: Omit<ListOnboardingApprovalsFilters, 'offset' | 'limit'>
): OnboardingApprovalUser[] {
  const province =
    filters.province && filters.province !== 'all' ? filters.province : null;
  const query = filters.query ?? '';

  return readMockUsers()
    .filter(
      (user) =>
        user.role !== 'super_admin' && user.docStatus !== 'not_submitted'
    )
    .filter((user) => user.docStatus === filters.status)
    .filter((user) => (province ? user.province === province : true))
    .filter((user) => matchesQuery(user, query))
    .sort((a, b) => (b.lastChange ?? 0) - (a.lastChange ?? 0))
    .map((record) => toApprovalUser(toPublicUser(record)));
}

function collectProvinces(): string[] {
  const names = new Set<string>();
  for (const user of readMockUsers()) {
    if (
      user.role === 'super_admin' ||
      user.docStatus === 'not_submitted' ||
      !user.province
    ) {
      continue;
    }
    names.add(user.province);
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b, 'fa'));
}

function patchUser(
  userId: string,
  patch: Partial<User>
): OnboardingApprovalUser {
  // Single writer — same path as ProfileService (ADR-006).
  const updated = patchMockAuthUser(
    { id: userId },
    {
      ...patch,
      lastChange: Date.now(),
      ...(patch.docStatus === 'approved'
        ? { adminRequestMessage: undefined }
        : {}),
    }
  );

  return toApprovalUser(toPublicUser(updated));
}

export const OnboardingApprovalsService = {
  /**
   * Offset/limit page for infinite-scroll tables (Nest contract: limit=10).
   */
  async listPage(
    filters: ListOnboardingApprovalsFilters
  ): Promise<ListOnboardingApprovalsPage> {
    if (!IS_MOCK_MODE) {
      throwRealModeNotImplemented('OnboardingApprovalsService.listPage');
    }
    requireOnboardingReview();
    await new Promise((resolve) => setTimeout(resolve, 200));

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

  async approveIdentityDoc(userId: string): Promise<OnboardingApprovalUser> {
    if (!IS_MOCK_MODE) {
      throwRealModeNotImplemented('OnboardingApprovalsService.approveIdentityDoc');
    }
    requireOnboardingReview();
    const current = findMockUserById(userId);
    if (!current) {
      throw new Error('کاربر موردنظر یافت نشد.');
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
    return patchUser(userId, {
      docStatus: 'approved',
      approved: true,
      adminRequestMessage: undefined,
    });
  },

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
    const current = findMockUserById(userId);
    if (!current) {
      throw new Error('کاربر موردنظر یافت نشد.');
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
    return patchUser(userId, {
      docStatus: 'rejected',
      approved: false,
      adminRequestMessage: trimmed,
    });
  },
};
