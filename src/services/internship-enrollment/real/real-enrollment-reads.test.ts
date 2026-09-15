import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getRealEnrollmentPageState,
  listRealEligibleSupervisors,
} from '@/services/internship-enrollment/real/real-enrollment-reads';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import { educationSchoolApi } from '@/services/admin-catalog/resources/education-school.api';
import { usersApi } from '@/services/users/users.api';
import type { InternshipEnrollmentActor } from '@/types/internship-enrollment';

vi.mock('@/services/require-nest-transport', () => ({
  requireNestTransport: vi.fn(),
}));

vi.mock('@/services/internship-enrollment/real/student-enrollments.api', () => ({
  ENROLLMENT_PROFESSORS_PAGE_SIZE: 20,
  studentEnrollmentsApi: {
    getOpenCourseSelection: vi.fn(),
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

const student: InternshipEnrollmentActor = {
  id: 'u1',
  role: 'student',
  approved: true,
};

describe('real enrollment reads', () => {
  beforeEach(() => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockReset();
    vi.mocked(studentEnrollmentsApi.listProfessors).mockReset();
    vi.mocked(studentEnrollmentsApi.listMine).mockReset();
    vi.mocked(studentEnrollmentsApi.listWeeks).mockReset().mockResolvedValue([]);
    vi.mocked(studentEnrollmentsApi.getScoreSummary).mockReset().mockResolvedValue(null);
    vi.mocked(educationSchoolApi.listSchoolsCatalog).mockReset().mockResolvedValue({
      data: [],
      hasNextPage: false,
    });
    vi.mocked(usersApi.getById).mockReset();
  });

  it('builds page state from the open semester and listMine', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      startClasses: false,
      lessons: [{ id: 'les-1', title: 'کارورزی ۱', status: true }],
    });
    vi.mocked(studentEnrollmentsApi.listMine).mockResolvedValue([]);

    const state = await getRealEnrollmentPageState({
      actor: student,
      level: 1,
    });
    expect(state.scenario).toBe('S3_enroll_open');
    expect(state.lessonId).toBe('les-1');
    expect(studentEnrollmentsApi.listMine).toHaveBeenCalled();
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
    vi.mocked(studentEnrollmentsApi.listMine).mockResolvedValue([
      {
        id: 'enr-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professorId: 'prof-1',
        schoolId: 'sch-1',
        teacherId: 'tch-1',
        status: 'active',
      },
    ]);
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

  it('reads school/teacher/professor names straight from the populated GET /student-enrollments list response — no extra GET /users or GET /admin/schools calls (matches live StudentEnrollmentListItemDto)', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      startClasses: true,
      lessons: [{ id: 'les-1', title: 'کارورزی ۱', status: true }],
    });
    vi.mocked(studentEnrollmentsApi.listMine).mockResolvedValue([
      {
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
      },
    ]);

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
    vi.mocked(studentEnrollmentsApi.listMine).mockResolvedValue([
      {
        id: 'enr-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professorId: { id: 'prof-1', firstName: 'سارا', lastName: 'احمدی' },
        schoolId: null,
        teacherId: null,
        status: 'active',
      },
    ]);

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
    vi.mocked(studentEnrollmentsApi.listMine).mockResolvedValue([
      {
        id: 'enr-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professor: { id: 'prof-1', firstName: 'سارا', lastName: 'احمدی' },
        status: 'active',
      },
    ]);
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
    vi.mocked(studentEnrollmentsApi.listMine).mockResolvedValue([
      {
        id: 'enr-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professor: { id: 'prof-1', firstName: 'سارا', lastName: 'احمدی' },
        status: 'active',
      },
    ]);
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
    vi.mocked(studentEnrollmentsApi.listMine).mockResolvedValue([
      {
        id: 'enr-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professor: { id: 'prof-1', firstName: 'سارا', lastName: 'احمدی' },
        status: 'active',
      },
    ]);
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
    vi.mocked(studentEnrollmentsApi.listMine).mockResolvedValue([
      {
        id: 'enr-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        professorId: 'prof-1',
        schoolId: null,
        teacherId: null,
        status: 'active',
      },
    ]);
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
});
