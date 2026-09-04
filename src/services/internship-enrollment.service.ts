import { isMockApiMode } from '@/lib/api-mode';
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
import {
  getRealEnrollmentPageState,
  listRealEligibleSupervisors,
} from '@/services/internship-enrollment/real/real-enrollment-reads';
import { assertEnrollmentWriteReady } from '@/services/internship-enrollment/real/real-enrollment-writes';
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

function gateEnrollmentWrite(surface: string): void {
  if (!isMockApiMode()) {
    assertEnrollmentWriteReady(surface);
  }
  assertMockClientHasPermission('internship.select');
}

function gateEnrollmentMock(): void {
  assertMockClientHasPermission('internship.select');
}

/**
 * ثبت‌نام کارورزی / مهارت‌آموزی.
 * real: ترم باز و فهرست استاد از `student-enrollments`؛ ثبت‌نام و گزارش هفته هنوز stub است.
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

  /** real: GET `open-course-selection`؛ mock: snapshot سرفصل. */
  async getEnrollmentPageState(
    input: GetEnrollmentPageStateInput
  ): Promise<InternshipEnrollmentPageState> {
    if (!isMockApiMode()) {
      return getRealEnrollmentPageState(input);
    }
    gateEnrollmentMock();
    return resolveEnrollmentPageState(input);
  },

  /** real: GET `professors?semesterId=&lessonId=`؛ فیلتر استان/پردیس/سرچ سمت کلاینت. */
  async listEligibleSupervisors(
    input: ListEligibleSupervisorsInput
  ): Promise<InternshipSupervisor[]> {
    if (!isMockApiMode()) {
      return listRealEligibleSupervisors(input);
    }
    gateEnrollmentMock();
    return listEligibleSupervisors(input);
  },

  async enrollWithSupervisor(
    input: EnrollWithSupervisorInput
  ): Promise<InternshipEnrollmentRecord> {
    gateEnrollmentWrite('InternshipEnrollmentService.enrollWithSupervisor');
    return enrollWithSupervisor(input);
  },

  async listDelayedSchools(
    input: ListDelayedSchoolsInput
  ): Promise<InternshipSchoolCapacity[]> {
    gateEnrollmentWrite('InternshipEnrollmentService.listDelayedSchools');
    return listDelayedSchools(input);
  },

  async listDelayedMentors(
    input: ListDelayedMentorsInput
  ): Promise<InternshipMentorCapacity[]> {
    gateEnrollmentWrite('InternshipEnrollmentService.listDelayedMentors');
    return listDelayedMentors(input);
  },

  async assignDelayedSchoolMentor(
    input: AssignDelayedSchoolMentorInput
  ): Promise<InternshipEnrollmentRecord> {
    gateEnrollmentWrite(
      'InternshipEnrollmentService.assignDelayedSchoolMentor'
    );
    return assignDelayedSchoolMentor(input);
  },

  async saveWeeklyReportDraft(
    input: SaveWeeklyReportDraftInput
  ): Promise<InternshipWeeklySession> {
    gateEnrollmentWrite('InternshipEnrollmentService.saveWeeklyReportDraft');
    return saveWeeklyReportDraft(input);
  },

  async submitWeeklyReport(
    input: SubmitWeeklyReportInput
  ): Promise<InternshipWeeklySession> {
    gateEnrollmentWrite('InternshipEnrollmentService.submitWeeklyReport');
    return submitWeeklyReport(input);
  },
};
