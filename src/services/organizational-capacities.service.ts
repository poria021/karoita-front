import { isMockApiMode } from '@/lib/api-mode';
import {
  mockCapacitiesSnapshot,
  mockCapacityTerms,
} from '@/services/organizational-capacities/mock/organizational-capacities.fixtures';
import {
  getRealOrganizationalCapacities,
  listRealCapacityTerms,
  submitRealOrganizationalCapacities,
} from '@/services/organizational-capacities/real/real-organizational-capacities';
import { useUserStore } from '@/store/useUserStore';
import type {
  GetOrganizationalCapacitiesInput,
  OrganizationalCapacitiesSnapshot,
  OrganizationalCapacityKind,
  SubmitOrganizationalCapacitiesInput,
  UpdateOrganizationalCapacityCourseInput,
} from '@/types/organizational-capacities';

function requireProfessorId(): string {
  const actor = useUserStore.getState().activeUser;
  if (!actor?.id) {
    throw new Error('نشست کاربری یافت نشد. لطفاً دوباره وارد شوید.');
  }
  return actor.id;
}

/**
 * ظرفیت جذب استاد راهنما.
 * real: `GET semesters_all` برای درس‌ها، سپس `GET/POST/PUT professor-capacities`.
 * mock: snapshot ثابت؛ نوشتن‌ها چیزی ذخیره نمی‌کنند.
 */
export const OrganizationalCapacitiesService = {
  async listTerms(
    kind: OrganizationalCapacityKind
  ): Promise<Array<{ id: string; title: string }>> {
    if (!isMockApiMode()) return listRealCapacityTerms(kind);
    return mockCapacityTerms(kind);
  },

  async getSnapshot(
    input: GetOrganizationalCapacitiesInput
  ): Promise<OrganizationalCapacitiesSnapshot> {
    const professorId = requireProfessorId();
    if (!isMockApiMode()) {
      return getRealOrganizationalCapacities(input, professorId);
    }
    return mockCapacitiesSnapshot(input);
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
    return mockCapacitiesSnapshot({ kind: input.kind, termId: input.termId });
  },

  async submit(
    input: SubmitOrganizationalCapacitiesInput
  ): Promise<OrganizationalCapacitiesSnapshot> {
    const professorId = requireProfessorId();
    if (!isMockApiMode()) {
      return submitRealOrganizationalCapacities(input, professorId);
    }
    return mockCapacitiesSnapshot({ kind: input.kind, termId: input.termId });
  },
};
