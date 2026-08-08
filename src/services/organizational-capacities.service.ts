import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import {
  getMockOrganizationalCapacities,
  listTermsForCapacityKind,
  submitMockOrganizationalCapacities,
  updateMockOrganizationalCapacityCourse,
} from '@/services/organizational-capacities/mock-organizational-capacities-store';
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
 * Supervisor intake-capacity config (organizational_capacities).
 * Real mode fail-closed until Nest routes land.
 *
 * Nest map:
 * - GET   /organizational-capacities/terms?kind=
 * - GET   /organizational-capacities?kind&termId
 * - PATCH /organizational-capacities/courses/:courseId
 * - POST  /organizational-capacities/submit
 */
export const OrganizationalCapacitiesService = {
  /** GET /organizational-capacities/terms?kind= */
  async listTerms(
    kind: OrganizationalCapacityKind
  ): Promise<Array<{ id: string; title: string }>> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('OrganizationalCapacitiesService.listTerms');
    }
    requireCapacityConfigure();
    return listTermsForCapacityKind(kind);
  },

  /** GET /organizational-capacities?kind&termId */
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

  /** PATCH /organizational-capacities/courses/:courseId */
  async updateCourse(
    input: UpdateOrganizationalCapacityCourseInput
  ): Promise<OrganizationalCapacitiesSnapshot> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('OrganizationalCapacitiesService.updateCourse');
    }
    const actorId = requireCapacityConfigure();
    return updateMockOrganizationalCapacityCourse(input, actorId);
  },

  /** POST /organizational-capacities/submit */
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
