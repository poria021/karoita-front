import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/syllabus-config/service/gates', () => ({
  gateSyllabus: () => {},
  gateSyllabusTermSettings: () => {},
  gateSyllabusConsumerRead: () => {},
}));

import {
  listLeafAvailability,
  resetEnrollmentSnapshotForTests,
} from '@/services/internship-enrollment/mock/mock-enrollment-store';
import { resetSyllabusSnapshotForTests } from '@/services/syllabus-config/mock/mock-syllabus-store';
import { courseCatalogMutations } from '@/services/syllabus-config/service/course-catalog-mutations';
import { offeringMutations } from '@/services/syllabus-config/service/offering-mutations';
import { termMutations } from '@/services/syllabus-config/service/term-mutations';

const USER_ID = 'student-availability-1';

function oldRecord(
  level: number,
  overrides: {
    userId?: string;
    kind?: 'internship' | 'apprenticeship';
    status?: 'active' | 'dropped' | 'completed';
    passed?: boolean;
    supervisorId?: string | null;
  } = {}
) {
  return {
    id: `enr-old-${level}-${overrides.userId ?? USER_ID}`,
    userId: overrides.userId ?? USER_ID,
    role: 'student' as const,
    kind: overrides.kind ?? ('internship' as const),
    level,
    termId: 'old-term',
    termTitle: 'نیم‌سال قدیمی',
    title: 'پروژه',
    supervisorId: overrides.supervisorId === undefined ? 'sup-rahimi' : overrides.supervisorId,
    supervisorName: 'استاد',
    schoolName: null,
    mentorName: null,
    status: overrides.status ?? ('completed' as const),
    ...(overrides.passed === undefined ? {} : { passed: overrides.passed }),
  };
}

function seedRecords(records: ReturnType<typeof oldRecord>[]) {
  resetEnrollmentSnapshotForTests({
    records,
    confirmedCapacity: {},
    weekReports: {},
  });
}

describe('listLeafAvailability (mock)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetSyllabusSnapshotForTests(null);
    resetEnrollmentSnapshotForTests(null);
  });

  async function setUpProjectCourse() {
    const snapshot = await courseCatalogMutations.createCourseDefinition({
      title: 'پروژه',
      audience: 'semester',
      isActive: true,
      subModules: [{ title: 'پروژه الف' }, { title: 'پروژه ب' }],
    });
    const project = snapshot.courseCatalog!.find((c) => c.title === 'پروژه')!;
    const [alpha, beta] = project.subModules;
    await termMutations.updateTermGates({
      termId: 'term_2',
      isEnrollOpen: true,
    });
    await offeringMutations.activateOffering({
      termId: 'term_2',
      courseCatalogId: alpha!.id,
    });
    return { alpha: alpha!, beta: beta! };
  }

  it('reports a registered leaf as offered only after its offering is activated', async () => {
    const { alpha, beta } = await setUpProjectCourse();
    expect(alpha.level).toBe(101);
    expect(beta.level).toBe(102);

    expect(
      listLeafAvailability({
        userId: USER_ID,
        kind: 'internship',
        levels: [101, 102],
      })
    ).toEqual({ offered: [101], enrolled: [] });
  });

  it('counts every past enrolment as taken — passed, failed or dropped', async () => {
    await setUpProjectCourse();
    seedRecords([
      oldRecord(101, { status: 'completed', passed: true }),
      oldRecord(102, { status: 'completed', passed: false }),
      oldRecord(103, { status: 'dropped' }),
    ]);

    expect(
      listLeafAvailability({
        userId: USER_ID,
        kind: 'internship',
        levels: [101, 102, 103, 104],
      }).enrolled
    ).toEqual([101, 102, 103]);
  });

  it('ignores other users, other kinds and records that never got a supervisor', async () => {
    await setUpProjectCourse();
    seedRecords([
      oldRecord(101, { userId: 'someone-else' }),
      oldRecord(102, { kind: 'apprenticeship' }),
      oldRecord(103, { supervisorId: null }),
    ]);

    expect(
      listLeafAvailability({
        userId: USER_ID,
        kind: 'internship',
        levels: [101, 102, 103],
      }).enrolled
    ).toEqual([]);
  });
});
