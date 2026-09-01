import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import {
  getMockOrganizationalCapacities,
  listTermsForCapacityKind,
  submitMockOrganizationalCapacities,
  updateMockOrganizationalCapacityCourse,
} from '@/services/organizational-capacities/mock/mock-organizational-capacities-store';
import {
  assertMockClientHasPermission,
  MOCK_AUTHZ_DENIED,
} from '@/services/mock/mock-authz';
import { useUserStore } from '@/store/useUserStore';
import type {
  GetOrganizationalCapacitiesInput,
  OrganizationalCapacitiesSnapshot,
  OrganizationalCapacityKind,
  SubmitOrganizationalCapacitiesInput,
  UpdateOrganizationalCapacityCourseInput,
} from '@/types/organizational-capacities';

function requireCapacityConfigure(): string {
  if (!isMockApiMode()) {
    throwRealModeNotImplemented('OrganizationalCapacitiesService');
  }
  assertMockClientHasPermission('capacity.configure');
  const actor = useUserStore.getState().activeUser;
  if (!actor || actor.role !== 'supervisor_professor') {
    throw new Error(MOCK_AUTHZ_DENIED);
  }
  return actor.id;
}

/**
 * ظرفیت جذب استاد راهنما. تا آمدن routeهای Nest در real fail-closed است.
 */
export const OrganizationalCapacitiesService = {
  async listTerms(
    kind: OrganizationalCapacityKind
  ): Promise<Array<{ id: string; title: string }>> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('OrganizationalCapacitiesService.listTerms');
    }
    requireCapacityConfigure();
    return listTermsForCapacityKind(kind);
  },

  async getSnapshot(
    input: GetOrganizationalCapacitiesInput
  ): Promise<OrganizationalCapacitiesSnapshot> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('OrganizationalCapacitiesService.getSnapshot');
    }
    const actorId = requireCapacityConfigure();
    await new Promise((resolve) => setTimeout(resolve, 180));
    return getMockOrganizationalCapacities(input, actorId);
  },

  /** اختیاری؛ فرم پیش‌نویس را محلی نگه می‌دارد. */
  async updateCourse(
    input: UpdateOrganizationalCapacityCourseInput
  ): Promise<OrganizationalCapacitiesSnapshot> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('OrganizationalCapacitiesService.updateCourse');
    }
    const actorId = requireCapacityConfigure();
    return updateMockOrganizationalCapacityCourse(input, actorId);
  },

  async submit(
    input: SubmitOrganizationalCapacitiesInput
  ): Promise<OrganizationalCapacitiesSnapshot> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('OrganizationalCapacitiesService.submit');
    }
    const actorId = requireCapacityConfigure();
    await new Promise((resolve) => setTimeout(resolve, 250));
    return submitMockOrganizationalCapacities(input, actorId);
  },
};
