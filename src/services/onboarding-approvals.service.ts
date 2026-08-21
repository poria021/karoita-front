import { IS_MOCK_MODE, throwRealModeNotImplemented } from '@/lib/api-mode';
import { delayMockAdminListPage } from '@/lib/mock-admin-list-delay';
import { subscribeMockAuthUsers } from '@/services/auth/mock-auth.store';
import { mapNestAuthUser } from '@/services/auth/nest-auth-mappers';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import {
  collectProvinces,
  listFilteredUsers,
  patchApprovalUser,
  requireExistingMockUser,
} from '@/services/onboarding-approvals/mock-onboarding-approvals';
import { usersApi } from '@/services/users/users.api';
import type {
  ListOnboardingApprovalsFilters,
  ListOnboardingApprovalsPage,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';
import {
  DEFAULT_PAGE_LIMIT,
  sliceOffsetLimitPage,
} from '@/utils/offset-limit-page';

export const ONBOARDING_APPROVALS_PAGE_SIZE = DEFAULT_PAGE_LIMIT;

function requireOnboardingReview(): void {
  if (!IS_MOCK_MODE) {
    throwRealModeNotImplemented('OnboardingApprovalsService');
  }
  assertMockClientHasPermission('onboarding.review');
}

/** Map Nest status string to FE `docStatus` */
function nestStatusLabel(
  docStatus: 'approved' | 'rejected' | 'pending_admin'
): 'CONFIRM' | 'REJECT' | 'PENDING' {
  if (docStatus === 'approved') return 'CONFIRM';
  if (docStatus === 'rejected') return 'REJECT';
  return 'PENDING';
}

/**
 * Onboarding identity-doc approval queue.
 *
 * Nest map:
 * - GET    /api/v1/users?filters={"status":"PENDING"}&page&limit → list queue
 * - PATCH  /api/v1/users/{id} documentStatus:CONFIRM → approve
 * - PATCH  /api/v1/users/{id} documentStatus:REJECT + rejectDescription → reject
 */
export const OnboardingApprovalsService = {
  /**
   * GET /api/v1/users?filters={"status":"PENDING"|"CONFIRM"|"REJECT"}&page&limit
   * Returns offset/limit page + province facet (provinces extracted from data in real mode).
   */
  async listPage(
    filters: ListOnboardingApprovalsFilters
  ): Promise<ListOnboardingApprovalsPage> {
    if (!IS_MOCK_MODE) {
      const nestStatus = nestStatusLabel(filters.status);
      const page = Math.floor((filters.offset ?? 0) / (filters.limit ?? ONBOARDING_APPROVALS_PAGE_SIZE)) + 1;
      const raw = await usersApi.list({
        page,
        limit: filters.limit ?? ONBOARDING_APPROVALS_PAGE_SIZE,
        filters: JSON.stringify({ status: nestStatus }),
      });

      const users: OnboardingApprovalUser[] = raw.data.map((row) => {
        const u = mapNestAuthUser(row);
        return { ...u, fullName: `${u.firstName} ${u.lastName}`.trim() };
      });

      return {
        items: users,
        total: users.length,
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
      provinces: collectProvinces(),
    };
  },

  /** PATCH /api/v1/users/{id} → documentStatus: CONFIRM */
  async approveIdentityDoc(userId: string): Promise<OnboardingApprovalUser> {
    if (!IS_MOCK_MODE) {
      const raw = await usersApi.update(userId, {
        documentStatus: 'CONFIRM',
        // required fields for UpdateUserDto — pass empty strings; Nest ignores unchanged
        firstName: '',
        lastName: '',
        provinceId: '',
        universityId: '',
        degreeId: '',
        userUniqueId: '',
        cityId: '',
        schoolId: '',
        educationalDistrictsId: '',
        rejectDescription: [],
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

  /** PATCH /api/v1/users/{id} → documentStatus: REJECT + rejectDescription */
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
      const raw = await usersApi.update(userId, {
        documentStatus: 'REJECT',
        rejectDescription: [trimmed],
        firstName: '',
        lastName: '',
        provinceId: '',
        universityId: '',
        degreeId: '',
        userUniqueId: '',
        cityId: '',
        schoolId: '',
        educationalDistrictsId: '',
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

  /**
   * استان‌های فیلتر queue.
   * در real mode از GET /api/admin/province/all استفاده می‌شود.
   */
  async listProvinces(): Promise<string[]> {
    if (!IS_MOCK_MODE) {
      const { adminCatalogApi } = await import(
        '@/services/admin-catalog/admin-catalog.api'
      );
      const provinces = await adminCatalogApi.getAllProvinces();
      // Backend may return duplicate province titles across different ids;
      // dedupe here so consumers (e.g. <KvSelectItem key={name}>) never see
      // repeated keys.
      return Array.from(new Set(provinces.map((p) => p.title)));
    }
    requireOnboardingReview();
    return collectProvinces();
  },

  /** Mock: auth-user store; real: no-op until Nest push/SSE */
  subscribeDirectoryChanges(listener: () => void): () => void {
    if (!IS_MOCK_MODE) {
      return () => {};
    }
    return subscribeMockAuthUsers(listener);
  },
};
