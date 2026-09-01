/**
 * بشکهٔ عمومی store mock ثبت‌نام.
 * پیاده‌سازی در helpers / reads / writes / weekly است.
 */

export {
  clampLevel,
  courseNameForKind,
  kindForRole,
  maxLevelForKind,
  resolveEnrollmentScenario,
} from '@/services/internship-enrollment/enrollment-mappers';
export { resetEnrollmentSnapshotForTests } from '@/services/internship-enrollment/mock/mock-enrollment-persistence';
export {
  listDelayedMentors,
  listDelayedSchools,
  listEligibleSupervisors,
  resolveEnrollmentPageState,
} from '@/services/internship-enrollment/mock/mock-enrollment-reads';
export {
  assignDelayedSchoolMentor,
  enrollWithSupervisor,
} from '@/services/internship-enrollment/mock/mock-enrollment-writes';
export {
  saveWeeklyReportDraft,
  submitWeeklyReport,
} from '@/services/internship-enrollment/mock/mock-enrollment-weekly';
