import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getRealEnrollmentPageState,
  listRealEligibleSupervisors,
} from '@/services/internship-enrollment/real/real-enrollment-reads';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import { loadWeekConversationMessages } from '@/services/daily-approvals/real/real-daily-approvals-conversations';
import { educationSchoolApi } from '@/services/admin-catalog/resources/education-school.api';
import { usersApi } from '@/services/users/users.api';
import type { InternshipEnrollmentActor } from '@/types/internship-enrollment';
import type {
  NestSemesterEnrolmentsByTerm,
  NestStudentEnrollment,
} from '@/types/nest-student-enrollments';

vi.mock('@/services/require-nest-transport', () => ({
  requireNestTransport: vi.fn(),
}));

vi.mock('@/services/internship-enrollment/real/student-enrollments.api', () => ({
  ENROLLMENT_PROFESSORS_PAGE_SIZE: 20,
  studentEnrollmentsApi: {
    getOpenCourseSelection: vi.fn(),
    listBySemester: vi.fn(),
    listProfessors: vi.fn(),
    listMine: vi.fn(),
    getById: vi.fn(),
    listWeeks: vi.fn(),
    getScoreSummary: vi.fn(),
  },
}));

vi.mock('@/services/admin-catalog/resources/education-school.api', () => ({
  educationSchoolApi: {
    listSchoolsCatalog: vi.fn(),
  },
}));

vi.mock('@/services/users/users.api', () => ({
  usersApi: {
    getById: vi.fn(),
  },
}));

vi.mock('@/services/daily-approvals/real/real-daily-approvals-conversations', () => ({
  loadWeekConversationMessages: vi.fn(),
}));

const student: InternshipEnrollmentActor = {
  id: 'u1',
  role: 'student',
  approved: true,
};

/** پاسخ `by-semester` با یک نیم‌سال/درس، همراه `enrolment` اختیاری روی همان درس. */
function bySemesterWithEnrolment(
  enrolment: NestStudentEnrollment | null
): NestSemesterEnrolmentsByTerm[] {
  return [
    {
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      startClasses: true,
      lessons: [
        {
          id: 'les-1',
          semesterId: 'sem-1',
          title: 'کارورزی ۱',
          status: true,
          enrolment,
        },
      ],
    },
  ];
}

describe('real enrollment reads', () => {
  beforeEach(() => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockReset();
    vi.mocked(studentEnrollmentsApi.listBySemester).mockReset().mockResolvedValue([]);
    vi.mocked(studentEnrollmentsApi.listProfessors).mockReset();
    vi.mocked(studentEnrollmentsApi.listMine).mockReset();
    vi.mocked(studentEnrollmentsApi.listWeeks).mockReset().mockResolvedValue([]);
    vi.mocked(studentEnrollmentsApi.getScoreSummary).mockReset().mockResolvedValue(null);
    vi.mocked(educationSchoolApi.listSchoolsCatalog).mockReset().mockResolvedValue({
      data: [],
      hasNextPage: false,
    });
    vi.mocked(usersApi.getById).mockReset();
    vi.mocked(loadWeekConversationMessages).mockReset().mockResolvedValue([]);
  });

  it('builds page state from the open semester and by-semester', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      startClasses: false,
      lessons: [{ id: 'les-1', title: 'کارورزی ۱', status: true }],
    });
    vi.mocked(studentEnrollmentsApi.listBySemester).mockResolvedValue(
      bySemesterWithEnrolment(null)
    );

    const state = await getRealEnrollmentPageState({
      actor: student,
      level: 1,
    });
    expect(state.scenario).toBe('S3_enroll_open');
    expect(state.lessonId).toBe('les-1');
    expect(studentEnrollmentsApi.listBySemester).toHaveBeenCalled();
  });

  it('degrades to S3/S1 instead of crashing when by-semester fails (best-effort, like listMine used to be)', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      startClasses: false,
      lessons: [{ id: 'les-1', title: 'کارورزی ۱', status: true }],
    });
    vi.mocked(studentEnrollmentsApi.listBySemester).mockRejectedValue(
      new Error('network down')
    );

    const state = await getRealEnrollmentPageState({
      actor: student,
      level: 1,
    });

    expect(state.scenario).toBe('S3_enroll_open');
  });

  it('shows the report page for an active enrolment even when no term is currently open', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue(null);
    vi.mocked(studentEnrollmentsApi.listBySemester).mockResolvedValue(
      bySemesterWithEnrolment({
        id: 'enr-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professorId: 'prof-1',
        status: 'active',
      })
    );

    const state = await getRealEnrollmentPageState({
      actor: student,
      level: 1,
    });

    expect(state.scenario).toBe('S5_term_active');
    expect(state.termId).toBe('sem-1');
  });

  it('resolves supervisor/school/mentor names via GET /users/{id} and GET /admin/schools — enrollment rows only ever carry raw ids', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      startClasses: true,
      lessons: [{ id: 'les-1', title: 'کارورزی ۱', status: true }],
    });
    vi.mocked(studentEnrollmentsApi.listBySemester).mockResolvedValue(
      bySemesterWithEnrolment({
        id: 'enr-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professorId: 'prof-1',
        schoolId: 'sch-1',
        teacherId: 'tch-1',
        status: 'active',
      })
    );
    vi.mocked(usersApi.getById).mockImplementation(async (id: string) => {
      if (id === 'prof-1') {
        return { firstName: 'سارا', lastName: 'احمدی' } as never;
      }
      if (id === 'tch-1') {
        return { firstName: 'امیرسام', lastName: 'زارعی' } as never;
      }
      return null as never;
    });
    vi.mocked(educationSchoolApi.listSchoolsCatalog).mockResolvedValue({
      data: [{ id: 'sch-1', title: 'دبیرستان نمونه' }],
      hasNextPage: false,
    });

    const state = await getRealEnrollmentPageState({
      actor: student,
      level: 1,
    });

    expect(state.scenario).toBe('S5_term_active');
    expect(state.enrollment?.schoolId).toBe('sch-1');
    expect(state.enrollment?.schoolName).toBe('دبیرستان نمونه');
    expect(state.enrollment?.mentorId).toBe('tch-1');
    expect(state.enrollment?.mentorName).toBe('امیرسام زارعی');
    expect(state.enrollment?.supervisorName).toBe('سارا احمدی');
    expect(state.enrollment?.status).toBe('active');
    expect(usersApi.getById).toHaveBeenCalledWith('prof-1');
    expect(usersApi.getById).toHaveBeenCalledWith('tch-1');
  });

  it('reads school/teacher/professor names straight from the populated by-semester enrolment — no extra GET /users or GET /admin/schools calls', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      startClasses: true,
      lessons: [{ id: 'les-1', title: 'کارورزی ۱', status: true }],
    });
    vi.mocked(studentEnrollmentsApi.listBySemester).mockResolvedValue(
      bySemesterWithEnrolment({
        id: 'enr-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professorId: 'prof-1',
        schoolId: 'sch-1',
        teacherId: 'tch-1',
        professor: { id: 'prof-1', firstName: 'سارا', lastName: 'احمدی' },
        school: { id: 'sch-1', title: 'دبیرستان نمونه' },
        teacher: { id: 'tch-1', firstName: 'امیرسام', lastName: 'زارعی' },
        status: 'active',
      })
    );

    const state = await getRealEnrollmentPageState({
      actor: student,
      level: 1,
    });

    expect(state.enrollment?.schoolId).toBe('sch-1');
    expect(state.enrollment?.schoolName).toBe('دبیرستان نمونه');
    expect(state.enrollment?.mentorId).toBe('tch-1');
    expect(state.enrollment?.mentorName).toBe('امیرسام زارعی');
    expect(state.enrollment?.supervisorName).toBe('سارا احمدی');
    expect(usersApi.getById).not.toHaveBeenCalled();
    expect(educationSchoolApi.listSchoolsCatalog).not.toHaveBeenCalled();
  });

  it('prefers a populated professorId document for supervisorName without an extra GET /users call', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      startClasses: true,
      lessons: [{ id: 'les-1', title: 'کارورزی ۱', status: true }],
    });
    vi.mocked(studentEnrollmentsApi.listBySemester).mockResolvedValue(
      bySemesterWithEnrolment({
        id: 'enr-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professorId: { id: 'prof-1', firstName: 'سارا', lastName: 'احمدی' },
        schoolId: null,
        teacherId: null,
        status: 'active',
      })
    );

    const state = await getRealEnrollmentPageState({
      actor: student,
      level: 1,
    });

    expect(state.enrollment?.supervisorName).toBe('سارا احمدی');
    expect(usersApi.getById).not.toHaveBeenCalled();
  });

  it('marks attendanceDaysUnavailableReason as capacity-exhausted when the professor is no longer in GET /professors', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      startClasses: true,
      lessons: [{ id: 'les-1', title: 'کارورزی ۱', status: true }],
    });
    vi.mocked(studentEnrollmentsApi.listBySemester).mockResolvedValue(
      bySemesterWithEnrolment({
        id: 'enr-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professor: { id: 'prof-1', firstName: 'سارا', lastName: 'احمدی' },
        status: 'active',
      })
    );
    vi.mocked(studentEnrollmentsApi.listProfessors).mockResolvedValue({
      data: [],
      hasNextPage: false,
    });

    const state = await getRealEnrollmentPageState({
      actor: student,
      level: 1,
    });

    expect(state.enrollment?.attendanceDaysLabel).toBe('');
    expect(state.enrollment?.attendanceDaysUnavailableReason).toBe(
      'capacity-exhausted'
    );
  });

  it('marks attendanceDaysUnavailableReason as error when GET /professors fails', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      startClasses: true,
      lessons: [{ id: 'les-1', title: 'کارورزی ۱', status: true }],
    });
    vi.mocked(studentEnrollmentsApi.listBySemester).mockResolvedValue(
      bySemesterWithEnrolment({
        id: 'enr-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professor: { id: 'prof-1', firstName: 'سارا', lastName: 'احمدی' },
        status: 'active',
      })
    );
    vi.mocked(studentEnrollmentsApi.listProfessors).mockRejectedValue(
      new Error('network down')
    );

    const state = await getRealEnrollmentPageState({
      actor: student,
      level: 1,
    });

    expect(state.enrollment?.attendanceDaysLabel).toBe('');
    expect(state.enrollment?.attendanceDaysUnavailableReason).toBe('error');
  });

  it('leaves attendanceDaysUnavailableReason null when the day resolves successfully', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      startClasses: true,
      lessons: [{ id: 'les-1', title: 'کارورزی ۱', status: true }],
    });
    vi.mocked(studentEnrollmentsApi.listBySemester).mockResolvedValue(
      bySemesterWithEnrolment({
        id: 'enr-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professor: { id: 'prof-1', firstName: 'سارا', lastName: 'احمدی' },
        status: 'active',
      })
    );
    vi.mocked(studentEnrollmentsApi.listProfessors).mockResolvedValue({
      data: [
        {
          id: 'prof-1',
          name: 'سارا احمدی',
          college: '',
          province: '',
          days: ['شنبه'],
          capacity: 1,
        },
      ],
      hasNextPage: false,
    });

    const state = await getRealEnrollmentPageState({
      actor: student,
      level: 1,
    });

    expect(state.enrollment?.attendanceDaysLabel).toBe('شنبه');
    expect(state.enrollment?.attendanceDaysUnavailableReason).toBeNull();
  });

  it('falls back to null names when GET /users/{id} fails (best-effort, does not crash the page)', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      startClasses: true,
      lessons: [{ id: 'les-1', title: 'کارورزی ۱', status: true }],
    });
    vi.mocked(studentEnrollmentsApi.listBySemester).mockResolvedValue(
      bySemesterWithEnrolment({
        id: 'enr-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professorId: 'prof-1',
        schoolId: null,
        teacherId: null,
        status: 'active',
      })
    );
    vi.mocked(usersApi.getById).mockRejectedValue(new Error('403'));
    vi.mocked(studentEnrollmentsApi.listProfessors).mockResolvedValue({
      data: [],
      hasNextPage: false,
    });

    const state = await getRealEnrollmentPageState({
      actor: student,
      level: 1,
    });

    expect(state.enrollment?.supervisorName).toBeNull();
  });

  it('pages professors until hasNextPage is false', async () => {
    vi.mocked(studentEnrollmentsApi.listProfessors)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'p1',
            name: 'استاد یک',
            college: '',
            province: '',
            days: [],
            capacity: 1,
          },
        ],
        hasNextPage: true,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'p2',
            name: 'استاد دو',
            college: '',
            province: '',
            days: [],
            capacity: 1,
          },
        ],
        hasNextPage: false,
      });

    const list = await listRealEligibleSupervisors({
      actor: student,
      kind: 'internship',
      level: 1,
      query: '',
      province: '',
      college: '',
      semesterId: 'sem-1',
      lessonId: 'les-1',
    });

    expect(studentEnrollmentsApi.listProfessors).toHaveBeenCalledTimes(2);
    expect(list.map((item) => item.id)).toEqual(['p1', 'p2']);
  });

  it('only shows the student\'s own submission text — a mentor/principal row on the same endpoint must not overwrite it', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue(null);
    vi.mocked(studentEnrollmentsApi.listBySemester).mockResolvedValue(
      bySemesterWithEnrolment({
        id: 'enr-1',
        studentId: 'u1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professorId: 'prof-1',
        status: 'active',
      })
    );
    vi.mocked(studentEnrollmentsApi.listWeeks).mockResolvedValue([
      { id: 'week-1', enrollmentId: 'enr-1' },
    ]);
    vi.mocked(loadWeekConversationMessages).mockResolvedValue([
      {
        id: 'm1',
        conversationId: 'c1',
        senderId: { id: 'u1', role: 'student' },
        text: 'گزارش خودم',
        fileIds: [],
        files: [],
        sequence: 1,
        createdAt: '2026-01-01T09:00:00.000Z',
        updatedAt: '2026-01-01T09:00:00.000Z',
      },
      {
        id: 'm2',
        conversationId: 'c1',
        senderId: { id: 'tch-1', role: 'mentor' },
        text: 'باید اصلاح شود',
        fileIds: [],
        files: [],
        sequence: 2,
        createdAt: '2026-01-01T10:00:00.000Z',
        updatedAt: '2026-01-01T10:00:00.000Z',
      },
    ]);

    const state = await getRealEnrollmentPageState({ actor: student, level: 1 });

    expect(state.enrollment?.weeks[0]?.text).toBe('گزارش خودم');
    expect(state.enrollment?.weeks[0]?.reportSubmittedAt).toBe('2026-01-01T09:00:00.000Z');
  });

  it('buckets week conversation feedback (text + rating) by senderId.role — as returned live by GET /conversations/{id}/messages', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue(null);
    vi.mocked(studentEnrollmentsApi.listBySemester).mockResolvedValue(
      bySemesterWithEnrolment({
        id: 'enr-1',
        studentId: 'u1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professorId: 'prof-1',
        teacherId: 'tch-1',
        status: 'active',
      })
    );
    vi.mocked(studentEnrollmentsApi.listWeeks).mockResolvedValue([
      { id: 'week-1', enrollmentId: 'enr-1' },
    ]);
    vi.mocked(loadWeekConversationMessages).mockResolvedValue([
      {
        id: 'm1',
        conversationId: 'c1',
        senderId: { id: 'prof-1', role: 'mentor' },
        text: 'نمره ثبت شد',
        fileIds: [],
        files: [],
        sequence: 1,
        createdAt: '2026-01-01T10:00:00.000Z',
        updatedAt: '2026-01-01T10:00:00.000Z',
      },
      {
        id: 'm2',
        conversationId: 'c1',
        senderId: { id: 'tch-1', role: 'teacher' },
        text: 'خوب بود',
        fileIds: [],
        files: [],
        rating: 4,
        sequence: 2,
        createdAt: '2026-01-01T11:00:00.000Z',
        updatedAt: '2026-01-01T11:00:00.000Z',
      },
      {
        id: 'm3',
        conversationId: 'c1',
        senderId: { id: 'principal-1', role: 'school_admin' },
        text: 'تایید می‌شود',
        fileIds: [],
        files: [],
        rating: 5,
        sequence: 3,
        createdAt: '2026-01-01T12:00:00.000Z',
        updatedAt: '2026-01-01T12:00:00.000Z',
      },
    ]);

    const state = await getRealEnrollmentPageState({ actor: student, level: 1 });

    expect(state.enrollment?.weeks[0]?.feedback).toEqual({
      advisor: 'نمره ثبت شد',
      advisorAt: '2026-01-01T10:00:00.000Z',
      mentor: 'خوب بود',
      mentorAt: '2026-01-01T11:00:00.000Z',
      mentorRating: '4',
      principal: 'تایید می‌شود',
      principalAt: '2026-01-01T12:00:00.000Z',
      principalRating: '5',
    });
  });

  it('marks a week needs_edit when the advisor left feedback without a score — rejection, not just pending', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue(null);
    vi.mocked(studentEnrollmentsApi.listBySemester).mockResolvedValue(
      bySemesterWithEnrolment({
        id: 'enr-1',
        studentId: 'u1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professorId: 'prof-1',
        status: 'active',
      })
    );
    vi.mocked(studentEnrollmentsApi.listWeeks).mockResolvedValue([
      { id: 'week-1', enrollmentId: 'enr-1', submittedAt: '2026-01-01T00:00:00.000Z' },
    ]);
    vi.mocked(loadWeekConversationMessages).mockResolvedValue([
      {
        id: 'm1',
        conversationId: 'c1',
        senderId: { id: 'prof-1', role: 'mentor' },
        text: 'لطفاً اصلاح کن',
        fileIds: [],
        files: [],
        sequence: 1,
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    ]);

    const state = await getRealEnrollmentPageState({ actor: student, level: 1 });

    expect(state.enrollment?.weeks[0]?.status).toBe('needs_edit');
  });

  it('clears needs_edit back to pending once the student resubmits after the advisor\'s rejection', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue(null);
    vi.mocked(studentEnrollmentsApi.listBySemester).mockResolvedValue(
      bySemesterWithEnrolment({
        id: 'enr-1',
        studentId: 'u1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professorId: 'prof-1',
        status: 'active',
      })
    );
    vi.mocked(studentEnrollmentsApi.listWeeks).mockResolvedValue([
      { id: 'week-1', enrollmentId: 'enr-1', submittedAt: '2026-01-03T00:00:00.000Z' },
    ]);
    // بازخورد رد استاد در 01-02، ولی دانشجو در 01-03 (بعدش) دوباره ارسال کرده.
    vi.mocked(loadWeekConversationMessages).mockResolvedValue([
      {
        id: 'm1',
        conversationId: 'c1',
        senderId: { id: 'u1', role: 'student' },
        text: 'نسخهٔ اول',
        fileIds: [],
        files: [],
        sequence: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'm2',
        conversationId: 'c1',
        senderId: { id: 'prof-1', role: 'mentor' },
        text: 'لطفاً اصلاح کن',
        fileIds: [],
        files: [],
        sequence: 2,
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
      {
        id: 'm3',
        conversationId: 'c1',
        senderId: { id: 'u1', role: 'student' },
        text: 'نسخهٔ اصلاح‌شده',
        fileIds: [],
        files: [],
        sequence: 3,
        createdAt: '2026-01-03T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      },
    ]);

    const state = await getRealEnrollmentPageState({ actor: student, level: 1 });

    expect(state.enrollment?.weeks[0]?.status).toBe('pending');
    expect(state.enrollment?.weeks[0]?.text).toBe('نسخهٔ اصلاح‌شده');
    // بازخورد قدیمیِ استاد باید همچنان قابل‌نمایش بماند (تاریخچه)، فقط دیگر وضعیت را رد نکند.
    expect(state.enrollment?.weeks[0]?.feedback?.advisor).toBe('لطفاً اصلاح کن');
  });
});
