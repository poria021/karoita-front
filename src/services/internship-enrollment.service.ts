import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import {
  enrollWithSupervisor,
  listEligibleSupervisors,
  resolveEnrollmentPageState,
} from '@/services/internship-enrollment/mock-enrollment-store';
import type {
  EnrollWithSupervisorInput,
  GetEnrollmentPageStateInput,
  InternshipEnrollmentPageState,
  InternshipEnrollmentRecord,
  InternshipSupervisor,
  ListEligibleSupervisorsInput,
} from '@/types/internship-enrollment';

function gateEnrollment(): 'mock' | never {
  if (!isMockApiMode()) {
    throwRealModeNotImplemented('InternshipEnrollmentService');
  }
  assertMockClientHasPermission('internship.select');
  return 'mock';
}

/**
 * Facade انتخاب واحد کارورزی / کارآموزی.
 *
 * Nest-blocked:
 * - شاخهٔ real: fail-closed تا endpoint Nest وصل شود
 * - تخصیص مدرسه/مربی، editor هفته و PDF در فازهای بعدی
 */
export const InternshipEnrollmentService = {
  /**
   * وضعیت صفحهٔ انتخاب واحد برای نقش + سطح زیرماژول.
   * ترم / درگاه ثبت‌نام از snapshot سرفصل خوانده می‌شود.
   */
  async getEnrollmentPageState(
    input: GetEnrollmentPageStateInput
  ): Promise<InternshipEnrollmentPageState> {
    gateEnrollment();
    return resolveEnrollmentPageState(input);
  },

  async listEligibleSupervisors(
    input: ListEligibleSupervisorsInput
  ): Promise<InternshipSupervisor[]> {
    gateEnrollment();
    return listEligibleSupervisors(input);
  },

  async enrollWithSupervisor(
    input: EnrollWithSupervisorInput
  ): Promise<InternshipEnrollmentRecord> {
    gateEnrollment();
    return enrollWithSupervisor(input);
  },
};
