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
 * Internship / apprenticeship enrollment facade.
 * Real mode fail-closed. Week PDF editor still mock-only this phase.
 *
 * Nest map:
 * - GET  /internships/enrollment?role&level
 * - GET  /internships/supervisors
 * - POST /internships/enroll
 * - GET  /internships/delayed/schools|mentors
 * - POST /internships/delayed/assign
 * - PUT  /internships/weeks/:weekId/draft
 * - POST /internships/weeks/:weekId/submit
 */
export const InternshipEnrollmentService = {
  /** role → course kind (stable across Nest) */
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

  /** GET /internships/enrollment — term/gates come from syllabus snapshot */
  async getEnrollmentPageState(
    input: GetEnrollmentPageStateInput
  ): Promise<InternshipEnrollmentPageState> {
    gateEnrollment();
    return resolveEnrollmentPageState(input);
  },

  /** GET /internships/supervisors */
  async listEligibleSupervisors(
    input: ListEligibleSupervisorsInput
  ): Promise<InternshipSupervisor[]> {
    gateEnrollment();
    return listEligibleSupervisors(input);
  },

  /** POST /internships/enroll */
  async enrollWithSupervisor(
    input: EnrollWithSupervisorInput
  ): Promise<InternshipEnrollmentRecord> {
    gateEnrollment();
    return enrollWithSupervisor(input);
  },

  /** GET /internships/delayed/schools */
  async listDelayedSchools(
    input: ListDelayedSchoolsInput
  ): Promise<InternshipSchoolCapacity[]> {
    gateEnrollment();
    return listDelayedSchools(input);
  },

  /** GET /internships/delayed/mentors */
  async listDelayedMentors(
    input: ListDelayedMentorsInput
  ): Promise<InternshipMentorCapacity[]> {
    gateEnrollment();
    return listDelayedMentors(input);
  },

  /** POST /internships/delayed/assign */
  async assignDelayedSchoolMentor(
    input: AssignDelayedSchoolMentorInput
  ): Promise<InternshipEnrollmentRecord> {
    gateEnrollment();
    return assignDelayedSchoolMentor(input);
  },

  /** PUT /internships/weeks/:weekId/draft */
  async saveWeeklyReportDraft(
    input: SaveWeeklyReportDraftInput
  ): Promise<InternshipWeeklySession> {
    gateEnrollment();
    return saveWeeklyReportDraft(input);
  },

  /** POST /internships/weeks/:weekId/submit */
  async submitWeeklyReport(
    input: SubmitWeeklyReportInput
  ): Promise<InternshipWeeklySession> {
    gateEnrollment();
    return submitWeeklyReport(input);
  },
};
