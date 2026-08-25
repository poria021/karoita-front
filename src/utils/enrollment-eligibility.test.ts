import { describe, expect, it } from 'vitest';

import {
  filterEligibleSupervisors,
  hasStudentTermEnrollmentConflict,
  normalizeEnrollmentCourseTitle,
} from './enrollment-eligibility';
import { toPersianDigits } from '@/utils/persianDigits';

const student = {
  id: 'student-1',
  role: 'student' as const,
  approved: true,
  province: ['تهران'],
  college: ['پردیس شهید باهنر تهران'],
  district: ['ناحیه ۱ تهران'],
};

const supervisors = [
  {
    id: 'eligible',
    name: 'دکتر سارا احمدی',
    college: 'پردیس شهید باهنر تهران',
    province: 'تهران',
    day: 'شنبه',
    capacity: 1,
  },
  {
    id: 'readonly',
    name: 'دکتر مریم احمدی',
    college: 'پردیس شهید باهنر تهران',
    province: 'تهران',
    day: 'شنبه',
    capacity: null,
    readOnly: true,
  },
  {
    id: 'outside',
    name: 'دکتر نادر رحیمی',
    college: 'پردیس شهید باهنر اصفهان',
    province: 'اصفهان',
    day: 'دوشنبه',
    capacity: 2,
  },
  {
    id: 'full',
    name: 'دکتر لیلا فرهادی',
    college: 'پردیس شهید باهنر تهران',
    province: 'تهران',
    day: 'سه‌شنبه',
    capacity: 0,
  },
];

const schools = [
  {
    id: 'school-1',
    name: 'مدرسه نمونه',
    province: 'تهران',
    district: 'ناحیه ۱ تهران',
    capacities: { 1: 1 },
  },
];

const mentors = [
  {
    id: 'mentor-1',
    name: 'معلم نمونه',
    schoolId: 'school-1',
    capacities: { 1: null },
  },
];

describe('enrollment eligibility', () => {
  it('keeps only matching, writable supervisors with remaining capacity', () => {
    expect(
      filterEligibleSupervisors({
        supervisors,
        actor: student,
        level: 1,
        query: 'سارا',
        province: 'تهران',
        college: 'پردیس شهید باهنر تهران',
        schools,
        mentors,
      }).map((supervisor) => supervisor.id)
    ).toEqual(['eligible']);
  });

  it('requires one available school and mentor in the permitted area', () => {
    expect(
      filterEligibleSupervisors({
        supervisors,
        actor: student,
        level: 1,
        query: '',
        province: 'تهران',
        college: 'پردیس شهید باهنر تهران',
        schools: [{ ...schools[0]!, capacities: { 1: 0 } }],
        mentors,
      })
    ).toEqual([]);
  });

  it('normalizes stored course titles and prevents a second student course', () => {
    expect(normalizeEnrollmentCourseTitle('کارورزی', 2)).toBe('کارورزی 2');
    expect(toPersianDigits(normalizeEnrollmentCourseTitle('کارورزی', 2))).toBe(
      'کارورزی ۲'
    );
    expect(
      hasStudentTermEnrollmentConflict({
        records: [
          {
            id: 'record-1',
            userId: student.id,
            role: 'student',
            kind: 'internship',
            level: 1,
            termId: 'term-1',
            termTitle: 'نیم‌سال',
            title: 'کارورزی ۱',
            supervisorId: 'sup-1',
            supervisorName: 'دکتر نمونه',
            schoolName: null,
            mentorName: null,
          },
        ],
        actor: student,
        kind: 'internship',
        level: 2,
        termId: 'term-1',
      })
    ).toBe(true);
  });

  it('keeps apprenticeship levels independent for skill learners', () => {
    expect(
      hasStudentTermEnrollmentConflict({
        records: [
          {
            id: 'record-1',
            userId: 'learner-1',
            role: 'skill_learner',
            kind: 'apprenticeship',
            level: 1,
            termId: 'term-1',
            termTitle: 'دوره',
            title: 'کارآموزی 1',
            supervisorId: 'sup-1',
            supervisorName: 'دکتر نمونه',
            schoolName: null,
            mentorName: null,
          },
        ],
        actor: { ...student, id: 'learner-1', role: 'skill_learner' as const },
        kind: 'apprenticeship',
        level: 2,
        termId: 'term-1',
      })
    ).toBe(false);
  });

  it('ignores completed enrollments when checking student conflicts', () => {
    expect(
      hasStudentTermEnrollmentConflict({
        records: [
          {
            id: 'record-1',
            userId: student.id,
            role: 'student',
            kind: 'internship',
            level: 1,
            termId: 'term-1',
            termTitle: 'نیم‌سال',
            title: 'کارورزی ۱',
            supervisorId: 'sup-1',
            supervisorName: 'دکتر نمونه',
            schoolName: null,
            mentorName: null,
            status: 'completed',
          },
        ],
        actor: student,
        kind: 'internship',
        level: 2,
        termId: 'term-1',
      })
    ).toBe(false);
  });
});
