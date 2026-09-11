import { IS_MOCK_MODE, throwRealModeNotImplemented } from '@/lib/api-mode';
import { delayMockAdminListPage } from '@/lib/mock-admin-list-delay';
import { subscribeMockAuthUsers } from '@/services/auth/mock/mock-auth.store';
import { mapNestAuthUser } from '@/services/auth/real/nest-auth-mappers';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import {
  collectProvinces,
  listFilteredUsers,
  patchApprovalUser,
  requireExistingMockUser,
} from '@/services/onboarding-approvals/mock/mock-onboarding-approvals';
import { usersApi } from '@/services/users/users.api';
import type {
  ListOnboardingApprovalsFilters,
  ListOnboardingApprovalsPage,
  OnboardingApprovalProvince,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';
import {
  DEFAULT_PAGE_LIMIT,
  estimateHasNextPageTotal,
  sliceOffsetLimitPage,
} from '@/utils/offset-limit-page';

export const ONBOARDING_APPROVALS_PAGE_SIZE = DEFAULT_PAGE_LIMIT;

function requireOnboardingReview(): void {
  if (!IS_MOCK_MODE) {
    throwRealModeNotImplemented('OnboardingApprovalsService');
  }
  assertMockClientHasPermission('onboarding.review');
}

/** نگاشت `docStatus` فرانت به فیلتر `status` در Nest. */
function nestStatusLabel(
  docStatus: 'approved' | 'rejected' | 'pending_admin'
): 'CONFIRM' | 'REJECT' | 'PENDING' {
  if (docStatus === 'approved') return 'CONFIRM';
  if (docStatus === 'rejected') return 'REJECT';
  return 'PENDING';
}

/**
 * صف تأیید مدرک هویت. فیلتر Nest روی `status` است نه `docStatus`.
 * قبل از PATCH باید GET شود وگرنه فیلدهای اجباری خالی می‌مانند.
 */
export const OnboardingApprovalsService = {
  async listPage(
    filters: ListOnboardingApprovalsFilters
  ): Promise<ListOnboardingApprovalsPage> {
    if (!IS_MOCK_MODE) {
      const nestStatus = nestStatusLabel(filters.status);
      const page =
        Math.floor(
          (filters.offset ?? 0) / (filters.limit ?? ONBOARDING_APPROVALS_PAGE_SIZE)
        ) + 1;

      const nestFilters: Record<string, unknown> = { status: nestStatus };
      if (filters.query?.trim()) nestFilters.firstName = filters.query.trim();
      if (filters.province && filters.province !== 'all') {
        nestFilters.provinceId = filters.province;
      }

      const raw = await usersApi.list({
        page,
        limit: filters.limit ?? ONBOARDING_APPROVALS_PAGE_SIZE,
        filters: JSON.stringify(nestFilters),
      });

      const users: OnboardingApprovalUser[] = raw.data.map((row) => {
        const u = mapNestAuthUser(row);
        return { ...u, fullName: `${u.firstName} ${u.lastName}`.trim() };
      });

      return {
        items: users,
        total: estimateHasNextPageTotal(
          filters.offset ?? 0,
          users.length,
          raw.hasNextPage
        ),
        hasMore: raw.hasNextPage,
        provinces: [],
      };
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
      provinces: collectProvinces().map((title) => ({ id: title, title })),
    };
  },

  /** `documentStatus: CONFIRM` — اول GET تا فیلدهای اجباری خالی نروند. */
  async approveIdentityDoc(userId: string): Promise<OnboardingApprovalUser> {
    if (!IS_MOCK_MODE) {
      const current = await usersApi.getById(userId);

      const raw = await usersApi.update(userId, {
        documentStatus: 'CONFIRM',
        firstName: current.firstName,
        lastName: current.lastName,
        userUniqueId: current.userUniqueId ?? undefined,
      });

      const u = mapNestAuthUser(raw);
      return { ...u, fullName: `${u.firstName} ${u.lastName}`.trim() };
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

  /**
   * `documentStatus: REJECT`. در Swagger، `rejectDescription` آبجکت تکی است نه آرایه.
   */
  async rejectIdentityDoc(
    userId: string,
    reason: string
  ): Promise<OnboardingApprovalUser> {
    if (!IS_MOCK_MODE) {
      const trimmed = reason.trim();
      if (!trimmed) {
        throw new Error(
          'لطفاً علت نقص یا عدم تایید مدارک را بنویسید یا انتخاب کنید.'
        );
      }

      const current = await usersApi.getById(userId);

      const raw = await usersApi.update(userId, {
        documentStatus: 'REJECT',
        firstName: current.firstName,
        lastName: current.lastName,
        userUniqueId: current.userUniqueId ?? undefined,
        rejectDescription: { id: 1, description: trimmed },
      });

      const u = mapNestAuthUser(raw);
      return { ...u, fullName: `${u.firstName} ${u.lastName}`.trim() };
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

  async listProvinces(): Promise<OnboardingApprovalProvince[]> {
    if (!IS_MOCK_MODE) {
      const { adminCatalogApi } = await import(
        '@/services/admin-catalog/admin-catalog.api'
      );
      const provinces = await adminCatalogApi.getAllProvinces();
      const seen = new Set<string>();
      return provinces
        .filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        })
        .map((p) => ({ id: p.id, title: p.title }));
    }
    requireOnboardingReview();
    return collectProvinces().map((title) => ({ id: title, title }));
  },

  /** در mock به store کاربران وصل می‌شود؛ real تا SSE خالی است. */
  subscribeDirectoryChanges(listener: () => void): () => void {
    if (!IS_MOCK_MODE) {
      return () => {};
    }
    return subscribeMockAuthUsers(listener);
  },
};
