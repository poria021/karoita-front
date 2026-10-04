import {
  findMockUserById,
  readMockUsers,
  toPublicUser,
} from '@/services/auth/mock/mock-auth.session';
import type { User } from '@/types/auth';
import type {
  ListOnboardingApprovalsFilters,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';
import { persianToEnglishDigits } from '@/utils/persianDigits';

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

export function mockApprovalUsers(
  filters: Omit<ListOnboardingApprovalsFilters, 'offset' | 'limit'>
): OnboardingApprovalUser[] {
  const province =
    filters.province && filters.province !== 'all' ? filters.province : null;
  const query = filters.query ?? '';

  return readMockUsers()
    .filter(
      (user) =>
        user.docStatus !== 'not_submitted'
    )
    .filter((user) => user.docStatus === filters.status)
    .filter((user) => (province ? (user.province ?? []).includes(province) : true))
    .filter((user) => matchesQuery(user, query))
    .sort((a, b) => (b.lastChange ?? 0) - (a.lastChange ?? 0))
    .map((record) => toApprovalUser(toPublicUser(record)));
}

export function mockApprovalProvinces(): string[] {
  const names = new Set<string>();
  for (const user of readMockUsers()) {
    if (user.docStatus === 'not_submitted' || !user.province) {
      continue;
    }
    for (const province of user.province) {
      names.add(province);
    }
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b, 'fa'));
}

/** بدون state: کاربر وصله‌شده فقط برگردانده می‌شود و ذخیره نمی‌شود. */
export function mockApprovalResult(
  userId: string,
  patch: Partial<User>
): OnboardingApprovalUser {
  const current = findMockUserById(userId);
  if (!current) {
    throw new Error('کاربر موردنظر یافت نشد.');
  }
  return toApprovalUser({
    ...toPublicUser(current),
    ...patch,
    lastChange: Date.now(),
  });
}
