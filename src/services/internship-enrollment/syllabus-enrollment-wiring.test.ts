import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  assignDelayedSchoolMentor,
  enrollWithSupervisor,
  listDelayedMentors,
  listDelayedSchools,
  resetEnrollmentSnapshotForTests,
  resolveEnrollmentPageState,
  resolveEnrollmentScenario,
} from '@/services/internship-enrollment/mock/mock-enrollment-store';
import {
  activateOfferingInSnapshot,
  buildSeedWeeks,
  getTodayJalaliSlash,
  INTERNSHIP_DEFAULT_WEEKS,
  resetSyllabusSnapshotForTests,
  writeSyllabusSnapshot,
} from '@/services/syllabus-config/mock/mock-syllabus-store';
import { buildCourseOfferingId } from '@/services/syllabus-config/syllabus-mappers';
import type { InternshipEnrollmentActor } from '@/types/internship-enrollment';
import type { SyllabusConfigSnapshot } from '@/types/syllabus-config';

const student: InternshipEnrollmentActor = {
  id: 'student-wire-1',
  role: 'student',
  approved: true,
  province: 'تهران',
  college: 'پردیس شهید باهنر تهران',
  district: 'ناحیه ۱ تهران',
};

const learner: InternshipEnrollmentActor = {
  id: 'learner-wire-1',
  role: 'skill_learner',
  approved: true,
  province: 'تهران',
  college: 'پردیس شهید باهنر تهران',
  district: 'ناحیه ۱ تهران',
};

function baseSnapshot(): SyllabusConfigSnapshot {
  return {
    terms: [
      {
        id: 'term_sem',
        title: 'نیم‌سال تست 1405-1406',
        type: 'semester',
        isEnrollOpen: false,
        isTermOpen: false,
        enrollStart: '',
        termStart: '',
      },
      {
        id: 'term_mod',
        title: 'دوره مهارتی تست 1405-1406',
        type: 'modular',
        isEnrollOpen: false,
        isTermOpen: false,
        enrollStart: '',
        termStart: '',
      },
    ],
    offerings: {},
    internships: [],
    globalProfessorCapacity: 15,
    passingScoreThreshold: 70,
  };
}

describe('syllabus → enrollment wiring', () => {
  beforeEach(() => {
    resetEnrollmentSnapshotForTests(null);
    resetSyllabusSnapshotForTests(baseSnapshot());
  });

  afterEach(() => {
    resetEnrollmentSnapshotForTests(null);
    resetSyllabusSnapshotForTests(null);
  });

  it('keeps pure scenario matrix intact', () => {
    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: false,
        enrollOpen: true,
        termOpen: false,
        registered: false,
      })
    ).toBe('S1_syllabus_blocked');
  });

  it('shows S1 when offering is inactive regardless of enroll gate', () => {
    const draft = baseSnapshot();
    const today = getTodayJalaliSlash();
    draft.terms[0]!.isEnrollOpen = true;
    draft.terms[0]!.enrollStart = today;
    writeSyllabusSnapshot(draft);

    const state = resolveEnrollmentPageState({ actor: student, level: 1 });
    expect(state.scenario).toBe('S1_syllabus_blocked');
  });

  it('shows S3 when offering is active and enroll is open', () => {
    const draft = baseSnapshot();
    const today = getTodayJalaliSlash();
    draft.terms[0]!.isEnrollOpen = true;
    draft.terms[0]!.enrollStart = today;
    activateOfferingInSnapshot(
      draft,
      'term_sem',
      'course_internship_1',
      'internship'
    );
    writeSyllabusSnapshot(draft);

    const state = resolveEnrollmentPageState({ actor: student, level: 1 });
    expect(state.scenario).toBe('S3_enroll_open');
    expect(state.termId).toBe('term_sem');
  });

  it('keeps S3 when enroll and term gates are both open (gates are independent)', () => {
    const draft = baseSnapshot();
    const today = getTodayJalaliSlash();
    draft.terms[0]!.isEnrollOpen = true;
    draft.terms[0]!.enrollStart = today;
    draft.terms[0]!.isTermOpen = true;
    draft.terms[0]!.termStart = today;
    activateOfferingInSnapshot(
      draft,
      'term_sem',
      'course_internship_1',
      'internship'
    );
    writeSyllabusSnapshot(draft);

    const before = resolveEnrollmentPageState({ actor: student, level: 1 });
    expect(before.scenario).toBe('S3_enroll_open');

    enrollWithSupervisor({
      actor: student,
      kind: 'internship',
      level: 1,
      termId: 'term_sem',
      supervisorId: 'sup-ahmadi',
    });

    const after = resolveEnrollmentPageState({ actor: student, level: 1 });
    expect(after.scenario).toBe('S5_term_active');
  });

  it('shows S2 when offering is active but enroll is closed', () => {
    const draft = baseSnapshot();
    activateOfferingInSnapshot(
      draft,
      'term_sem',
      'course_internship_1',
      'internship'
    );
    writeSyllabusSnapshot(draft);

    const state = resolveEnrollmentPageState({ actor: student, level: 1 });
    expect(state.scenario).toBe('S2_enroll_closed');
  });

  it('shows S4 after persisted enroll without demo seeds', () => {
    const draft = baseSnapshot();
    const today = getTodayJalaliSlash();
    draft.terms[0]!.isEnrollOpen = true;
    draft.terms[0]!.enrollStart = today;
    activateOfferingInSnapshot(
      draft,
      'term_sem',
      'course_internship_1',
      'internship'
    );
    writeSyllabusSnapshot(draft);

    enrollWithSupervisor({
      actor: student,
      kind: 'internship',
      level: 1,
      termId: 'term_sem',
      supervisorId: 'sup-ahmadi',
    });

    const state = resolveEnrollmentPageState({ actor: student, level: 1 });
    expect(state.scenario).toBe('S4_registered_waiting');
    expect(state.enrollment?.supervisorName).toBe('دکتر سارا احمدی');
    expect(state.enrollment?.schoolName).toBeNull();
    expect(state.enrollment?.mentorName).toBeNull();
  });

  it('persists delayed school and mentor assignment, then shows S5 after term opens', () => {
    const draft = baseSnapshot();
    const today = getTodayJalaliSlash();
    draft.terms[0]!.isEnrollOpen = true;
    draft.terms[0]!.enrollStart = today;
    activateOfferingInSnapshot(
      draft,
      'term_sem',
      'course_internship_1',
      'internship'
    );
    const offeringId = buildCourseOfferingId(
      'term_sem',
      'course_internship_1'
    );
    draft.offerings[offeringId]!.weeks = buildSeedWeeks(
      INTERNSHIP_DEFAULT_WEEKS,
      'active'
    );
    writeSyllabusSnapshot(draft);
    enrollWithSupervisor({
      actor: student,
      kind: 'internship',
      level: 1,
      termId: 'term_sem',
      supervisorId: 'sup-ahmadi',
    });

    const school = listDelayedSchools({
      actor: student,
      level: 1,
      query: 'البرز',
    })[0];
    expect(school?.id).toBe('school-tehran-1');
    const mentor = listDelayedMentors({
      actor: student,
      level: 1,
      schoolId: school!.id,
      query: 'ملکی',
    })[0];
    expect(mentor?.id).toBe('mentor-tehran-1');

    const assigned = assignDelayedSchoolMentor({
      actor: student,
      kind: 'internship',
      level: 1,
      termId: 'term_sem',
      schoolId: school!.id,
      mentorId: mentor!.id,
    });
    expect(assigned.schoolName).toBe('دبیرستان ماندگار البرز');
    expect(assigned.mentorName).toBe('آقای مرتضی ملکی');
    expect(assigned.attendanceDaysLabel).toBe('شنبه');

    draft.terms[0]!.isTermOpen = true;
    draft.terms[0]!.termStart = today;
    writeSyllabusSnapshot(draft);
    const state = resolveEnrollmentPageState({ actor: student, level: 1 });
    expect(state.scenario).toBe('S5_term_active');
    expect(state.enrollment?.schoolName).toBe('دبیرستان ماندگار البرز');
    expect(state.enrollment?.mentorName).toBe('آقای مرتضی ملکی');
    expect(state.enrollment?.weeks).toHaveLength(INTERNSHIP_DEFAULT_WEEKS);
  });

  it('uses S5 for completed and removal-pending records outside the open term', () => {
    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: true,
        enrollOpen: false,
        termOpen: false,
        registered: true,
        status: 'completed',
      })
    ).toBe('S5_term_active');
    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: true,
        enrollOpen: false,
        termOpen: false,
        registered: true,
        removalPending: true,
      })
    ).toBe('S5_term_active');
  });

  it('uses modular term for skill learner offerings', () => {
    const draft = baseSnapshot();
    const today = getTodayJalaliSlash();
    draft.terms[1]!.isEnrollOpen = true;
    draft.terms[1]!.enrollStart = today;
    activateOfferingInSnapshot(
      draft,
      'term_mod',
      'course_apprenticeship_1',
      'apprenticeship'
    );
    writeSyllabusSnapshot(draft);

    const state = resolveEnrollmentPageState({ actor: learner, level: 1 });
    expect(state.kind).toBe('apprenticeship');
    expect(state.termId).toBe('term_mod');
    expect(state.scenario).toBe('S3_enroll_open');
  });
});
