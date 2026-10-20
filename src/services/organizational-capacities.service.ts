import { isMockApiMode } from '@/lib/api-mode';
import {
  getMockOrganizationalCapacities,
  listTermsForCapacityKind,
  submitMockOrganizationalCapacities,
  updateMockOrganizationalCapacityCourse,
} from '@/services/organizational-capacities/mock/mock-organizational-capacities-store';
import {
  getRealOrganizationalCapacities,
  loadRealCapacityCatalog,
  submitRealOrganizationalCapacities,
} from '@/services/organizational-capacities/real/real-organizational-capacities';
import {
  assertMockClientHasPermission,
  MOCK_AUTHZ_DENIED,
} from '@/services/mock/mock-authz';
import { useUserStore } from '@/store/useUserStore';
import type {
  GetOrganizationalCapacitiesInput,
  OrganizationalCapacitiesSnapshot,
  OrganizationalCapacityCatalog,
  OrganizationalCapacityKind,
  SubmitOrganizationalCapacitiesInput,
  UpdateOrganizationalCapacityCourseInput,
} from '@/types/organizational-capacities';

function requireProfessorId(): string {
  const actor = useUserStore.getState().activeUser;
  if (!actor?.id) {
    throw new Error(MOCK_AUTHZ_DENIED);
  }
  if (isMockApiMode()) {
    assertMockClientHasPermission('capacity.configure');
    if (actor.role !== 'supervisor_professor') {
      throw new Error(MOCK_AUTHZ_DENIED);
    }
  }
  return actor.id;
}

/**
 * ظرفیت جذب استاد راهنما.
 * real: لود = `GET semesters_all` + `GET settings` (یک‌بار، در cache) + `GET professor-capacities`؛
 * ذخیره = `POST/PUT professor-capacities` + یک `GET` بازخوانی.
 */
export const OrganizationalCapacitiesService = {
  /** ترم‌ها (+ در real: درس‌ها و سقف عمومی). یک‌بار می‌خوانی و cache می‌کنی. */
  async loadCatalog(
    kind: OrganizationalCapacityKind
  ): Promise<OrganizationalCapacityCatalog> {
    if (!isMockApiMode()) {
      return loadRealCapacityCatalog(kind);
    }
    requireProfessorId();
    return { terms: listTermsForCapacityKind(kind) };
  },

  async getSnapshot(
    input: GetOrganizationalCapacitiesInput
  ): Promise<OrganizationalCapacitiesSnapshot> {
    const professorId = requireProfessorId();
    if (!isMockApiMode()) {
      return getRealOrganizationalCapacities(input, professorId);
    }
    await new Promise((resolve) => setTimeout(resolve, 180));
    return getMockOrganizationalCapacities(input, professorId);
  },

  /** اختیاری؛ فرم پیش‌نویس را محلی نگه می‌دارد. در real همان snapshot سرور است. */
  async updateCourse(
    input: UpdateOrganizationalCapacityCourseInput
  ): Promise<OrganizationalCapacitiesSnapshot> {
    const professorId = requireProfessorId();
    if (!isMockApiMode()) {
      return getRealOrganizationalCapacities(
        { kind: input.kind, termId: input.termId },
        professorId
      );
    }
    return updateMockOrganizationalCapacityCourse(input, professorId);
  },

  async submit(
    input: SubmitOrganizationalCapacitiesInput
  ): Promise<OrganizationalCapacitiesSnapshot> {
    const professorId = requireProfessorId();
    if (!isMockApiMode()) {
      return submitRealOrganizationalCapacities(input, professorId);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
    return submitMockOrganizationalCapacities(input, professorId);
  },
};
