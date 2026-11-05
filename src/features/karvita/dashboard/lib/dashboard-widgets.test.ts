import { describe, expect, it } from 'vitest';

import type { UserRole } from '@/types/auth';

import { getDashboardWidgets } from './dashboard-widgets';

const ROLES: UserRole[] = [
  'super_admin',
  'assistant_admin',
  'central_organization',
  'provincial_university',
  'faculty_role',
  'regional_edu_admin',
  'school_principal',
  'supervisor_professor',
  'mentor_teacher',
  'student',
  'skill_learner',
];

describe('getDashboardWidgets', () => {
  it('puts the ad + announcements row first on every panel', () => {
    for (const role of ROLES) {
      expect(getDashboardWidgets(role)[0]).toEqual({ id: 'bulletins', span: 'full' });
    }
  });

  it('adds the weekly grades chart under bulletins for student and skill_learner', () => {
    expect(getDashboardWidgets('student')).toEqual([
      { id: 'bulletins', span: 'full' },
      { id: 'learner_grades', span: 'full' },
    ]);
    expect(getDashboardWidgets('skill_learner')).toEqual([
      { id: 'bulletins', span: 'full' },
      { id: 'learner_grades', span: 'full' },
    ]);
    expect(getDashboardWidgets('faculty_role')).toEqual([
      { id: 'bulletins', span: 'full' },
    ]);
  });
});
