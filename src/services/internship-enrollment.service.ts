import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import {
  clampLevel,
  courseNameForKind,
  kindForRole,
  maxLevelForKind,
} from '@/services/internship-enrollment/enrollment-mappers';
import {
  assignDelayedSchoolMentor,
  enrollWithSupervisor,
  listDelayedMentors,
  listDelayedSchools,
  listEligibleSupervisors,
  resolveEnrollmentPageState,
  saveWeeklyReportDraft,
  submitWeeklyReport,
} from '@/services/internship-enrollment/mock/mock-enrollment-store';
import type {
  AssignDelayedSchoolMentorInput,
  EnrollWithSupervisorInput,
  GetEnrollmentPageStateInput,
  InternshipCourseKind,
  InternshipEnrollmentLevel,
  InternshipEnrollmentPageState,
  InternshipEnrollmentRecord,
  InternshipEnrollmentRole,
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
 * ثبت‌نام کارورزی / مهارت‌آموزی. در real fail-closed است؛ ویرایشگر PDF هفته هنوز mock است.
 */
export const InternshipEnrollmentService = {
  /** نقش → نوع درس؛ در Nest هم همین نگاشت پایدار است. */
  kindForRole,
  courseNameForKind,
  maxLevelForKind,
  clampLevel,

  resolveLevelForRole(
    role: InternshipEnrollmentRole,
    level: InternshipEnrollmentLevel
  ): {
    kind: InternshipCourseKind;
    level: InternshipEnrollmentLevel;
    maxLevel: 2 | 4;
  } {
    const kind = kindForRole(role);
    return {
      kind,
      level: clampLevel(kind, level),
      maxLevel: maxLevelForKind(kind),
    };
  },

  /** ترم و گیت‌ها از snapshot سرفصل می‌آیند، نه از Nest جدا. */
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
