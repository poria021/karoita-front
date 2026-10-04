import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/syllabus-config/service/gates', () => ({
  gateSyllabus: () => {},
  gateSyllabusTermSettings: () => {},
  gateSyllabusConsumerRead: () => {},
}));

import {
  enrollWithSupervisor,
  resetEnrollmentSnapshotForTests,
  resolveEnrollmentPageState,
} from '@/services/internship-enrollment/mock/mock-enrollment-store';
import { resetSyllabusSnapshotForTests } from '@/services/syllabus-config/mock/mock-syllabus-store';
import { courseCatalogMutations } from '@/services/syllabus-config/service/course-catalog-mutations';
import { offeringMutations } from '@/services/syllabus-config/service/offering-mutations';
import { termMutations } from '@/services/syllabus-config/service/term-mutations';
import type { InternshipEnrollmentActor } from '@/types/internship-enrollment';

const ACTOR: InternshipEnrollmentActor = {
  id: 'student-dynamic-1',
  role: 'student',
  approved: true,
  province: ['تهران'],
  college: ['پردیس شهید باهنر تهران'],
  district: ['ناحیه ۱ تهران'],
};

describe('enrollment in a course defined by the super admin (mock)', () => {
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

  it('gives every new leaf a stable level above the fixed 1..4 range', async () => {
    const { alpha, beta } = await setUpProjectCourse();
    expect(alpha.level).toBe(101);
    expect(beta.level).toBe(102);

    // ویرایش عنوان، سطح leaf ها را عوض نمی‌کند و leaf تازه سطح بعدی را می‌گیرد.
    const project = (await courseCatalogMutations.listCourseDefinitions()).find(
      (c) => c.title === 'پروژه'
    )!;
    const edited = await courseCatalogMutations.updateCourseDefinition(
      project.id,
      {
        title: 'پروژه',
        audience: 'semester',
        isActive: true,
        subModules: [
          { id: beta.id, title: 'پروژه ب' },
          { id: alpha.id, title: 'پروژه الف' },
          { title: 'پروژه ج' },
        ],
      }
    );
    const subs = edited.courseCatalog!.find((c) => c.id === project.id)!
      .subModules;
    expect(subs.map((s) => [s.title, s.level])).toEqual([
      ['پروژه ب', 102],
      ['پروژه الف', 101],
      ['پروژه ج', 103],
    ]);
  });

  it('opens enrollment for an offered leaf and registers with its own title', async () => {
    const { alpha } = await setUpProjectCourse();

    const state = resolveEnrollmentPageState({ actor: ACTOR, level: 101 });
    expect(state.scenario).toBe('S3_enroll_open');
    expect(state.level).toBe(101);
    expect(state.courseTitle).toBe('پروژه الف');
    expect(state.lessonId).toBe(alpha.id);

    const record = enrollWithSupervisor({
      actor: ACTOR,
      kind: 'internship',
      level: 101,
      termId: state.termId,
      supervisorId: 'sup-rahimi',
    });
    expect(record.title).toBe('پروژه الف');

    const after = resolveEnrollmentPageState({ actor: ACTOR, level: 101 });
    expect(after.scenario).toBe('S4_registered_waiting');
    expect(after.enrollment?.courseTitle).toBe('پروژه الف');
  });

  it('keeps a leaf that is not offered blocked until the admin activates it', async () => {
    const { beta } = await setUpProjectCourse();
    expect(beta.level).toBe(102);
    const state = resolveEnrollmentPageState({ actor: ACTOR, level: 102 });
    expect(state.scenario).toBe('S1_syllabus_blocked');
  });
});
