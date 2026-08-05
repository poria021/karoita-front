import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import {
  assignDelayedSchoolMentor,
  enrollWithSupervisor,
  listDelayedMentors,
  listDelayedSchools,
  listEligibleSupervisors,
  resolveEnrollmentPageState,
  saveWeeklyReportDraft,
  submitWeeklyReport,
} from '@/services/internship-enrollment/mock-enrollment-store';
import type {
  AssignDelayedSchoolMentorInput,
  EnrollWithSupervisorInput,
  GetEnrollmentPageStateInput,
  InternshipEnrollmentPageState,
  InternshipEnrollmentRecord,
  InternshipMentorCapacity,
  InternshipSchoolCapacity,
  InternshipSupervisor,
  InternshipWeeklySession,
  ListDelayedMentorsInput,
  ListDelayedSchoolsInput,
  ListEligibleSupervisorsInput,
  SaveWeeklyReportDraftInput,
  SubmitWeeklyReportInput,
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
 * - editor هفته و PDF در فازهای بعدی (mock draft/submit همین فاز)
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

  async listDelayedSchools(
    input: ListDelayedSchoolsInput
  ): Promise<InternshipSchoolCapacity[]> {
    gateEnrollment();
    return listDelayedSchools(input);
  },

  async listDelayedMentors(
    input: ListDelayedMentorsInput
  ): Promise<InternshipMentorCapacity[]> {
    gateEnrollment();
    return listDelayedMentors(input);
  },

  async assignDelayedSchoolMentor(
    input: AssignDelayedSchoolMentorInput
  ): Promise<InternshipEnrollmentRecord> {
    gateEnrollment();
    return assignDelayedSchoolMentor(input);
  },

  async saveWeeklyReportDraft(
    input: SaveWeeklyReportDraftInput
  ): Promise<InternshipWeeklySession> {
    gateEnrollment();
    return saveWeeklyReportDraft(input);
  },

  async submitWeeklyReport(
    input: SubmitWeeklyReportInput
  ): Promise<InternshipWeeklySession> {
    gateEnrollment();
    return submitWeeklyReport(input);
  },
};
