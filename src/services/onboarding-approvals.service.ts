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

/** Map FE docStatus → Nest filter status string */
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
 * Nest endpoints used:
 * - GET    /api/v1/users?filters={"status":"PENDING"|"CONFIRM"|"REJECT"}&page&limit
 * - GET    /api/v1/users/{id}          ← fetch current data before PATCH
 * - PATCH  /api/v1/users/{id}          documentStatus: "CONFIRM"
 * - PATCH  /api/v1/users/{id}          documentStatus: "REJECT" + rejectDescription
 */
export const OnboardingApprovalsService = {
  /**
   * GET /api/v1/users?filters={"status":"PENDING"|"CONFIRM"|"REJECT"}&page&limit
   */
  async listPage(
    filters: ListOnboardingApprovalsFilters
  ): Promise<ListOnboardingApprovalsPage> {
    if (!IS_MOCK_MODE) {
      const nestStatus = nestStatusLabel(filters.status);
      const page =
        Math.floor(
          (filters.offset ?? 0) / (filters.limit ?? ONBOARDING_APPROVALS_PAGE_SIZE)
        ) + 1;

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

  /**
   * PATCH /api/v1/users/{id} → documentStatus: "CONFIRM"
   *
   * اول اطلاعات فعلی کاربر رو می‌گیریم (GET /api/v1/users/{id}) تا
   * فیلدهای اجباری با مقدار واقعی پر بشن و بک‌اند رد نکنه.
   */
  async approveIdentityDoc(userId: string): Promise<OnboardingApprovalUser> {
    if (!IS_MOCK_MODE) {
      // ۱. اطلاعات فعلی کاربر رو بگیر
      const current = await usersApi.getById(userId);

      // ۲. فقط documentStatus رو تغییر بده، بقیه فیلدها دست نخورده بمونن
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
   * PATCH /api/v1/users/{id} → documentStatus: "REJECT" + rejectDescription
   *
   * Swagger PATCH request schema: rejectDescription: { id: number, description: string } — آبجکت تکی.
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

      // ۱. اطلاعات فعلی کاربر رو بگیر
      const current = await usersApi.getById(userId);

      // ۲. PATCH با documentStatus: REJECT و دلیل رد
      // Swagger PATCH request schema: rejectDescription یک آبجکت تکی است، نه آرایه.
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

  /**
   * لیست استان‌های موجود در صف بررسی.
   * Real mode: GET /api/admin/province/all
   */
  async listProvinces(): Promise<string[]> {
    if (!IS_MOCK_MODE) {
      const { adminCatalogApi } = await import(
        '@/services/admin-catalog/admin-catalog.api'
      );
      const provinces = await adminCatalogApi.getAllProvinces();
      return Array.from(new Set(provinces.map((p) => p.title)));
    }
    requireOnboardingReview();
    return collectProvinces();
  },

  /** Mock: subscribe to auth-user store changes; real: no-op (no SSE yet) */
  subscribeDirectoryChanges(listener: () => void): () => void {
    if (!IS_MOCK_MODE) {
      return () => {};
    }
    return subscribeMockAuthUsers(listener);
  },
};
