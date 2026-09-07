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
  getRealMentorCapacity,
  listRealEligibleSupervisors,
  listRealMentorStudents,
} from '@/services/internship-enrollment/real/real-enrollment-reads';
import {
  assertEnrollmentWriteReady,
  assignRealDelayedSchoolMentor,
  cancelRealEnrollment,
  enrollRealWithSupervisor,
} from '@/services/internship-enrollment/real/real-enrollment-writes';
import {
  realSaveWeeklyReportDraft,
  realSubmitWeeklyReport,
} from '@/services/internship-enrollment/real/real-enrollment-weekly';
import type {
  AssignDelayedSchoolMentorInput,
  CancelEnrollmentInput,
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
import type { NestMentorCapacity, NestMentorStudentsPage } from '@/types/nest-student-enrollments';

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
 * real: ترم باز، فهرست استاد و ثبت‌نام اولیه از `student-enrollments`؛ گزارش هفته هنوز stub است.
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
    if (!isMockApiMode()) {
      return enrollRealWithSupervisor(input);
    }
    gateEnrollmentMock();
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

  /**
   * real: PATCH `/student-enrollments/{id}` (فقط مدرسه/معلم).
   * توجه: انتخاب مدرسه/معلم (`listDelayedSchools`/`listDelayedMentors`) هنوز stub
   * است — این نوشتن آماده است ولی فلوی کامل UI تا وصل‌شدن آن دو کار نمی‌کند.
   */
  async assignDelayedSchoolMentor(
    input: AssignDelayedSchoolMentorInput
  ): Promise<InternshipEnrollmentRecord> {
    if (!isMockApiMode()) {
      return assignRealDelayedSchoolMentor(input);
    }
    gateEnrollmentMock();
    return assignDelayedSchoolMentor(input);
  },

  /** PATCH `/student-enrollments/{id}/cancel` — لغو ثبت‌نام دانشجو. */
  async cancelEnrollment(input: CancelEnrollmentInput): Promise<void> {
    if (!isMockApiMode()) {
      return cancelRealEnrollment(input);
    }
    gateEnrollmentMock();
  },

  /**
   * GET `/student-enrollments/mentor/students` — فهرست دانشجویان منتور.
   * فقط در real mode؛ mock endpoint ندارد.
   */
  async listMentorStudents(query: {
    semesterId?: string;
    lessonId?: string;
    page?: number;
    limit?: number;
  }): Promise<NestMentorStudentsPage> {
    return listRealMentorStudents(query);
  },

  /**
   * GET `/student-enrollments/mentor/capacity` — ظرفیت منتور در یک ترم.
   * فقط در real mode؛ mock endpoint ندارد.
   */
  async getMentorCapacity(semesterId: string): Promise<NestMentorCapacity> {
    return getRealMentorCapacity(semesterId);
  },

  async saveWeeklyReportDraft(
    input: SaveWeeklyReportDraftInput
  ): Promise<InternshipWeeklySession> {
    if (!isMockApiMode()) {
      return realSaveWeeklyReportDraft(input);
    }
    gateEnrollmentMock();
    return saveWeeklyReportDraft(input);
  },

  async submitWeeklyReport(
    input: SubmitWeeklyReportInput
  ): Promise<InternshipWeeklySession> {
    if (!isMockApiMode()) {
      return realSubmitWeeklyReport(input);
    }
    gateEnrollmentMock();
    return submitWeeklyReport(input);
  },
};
