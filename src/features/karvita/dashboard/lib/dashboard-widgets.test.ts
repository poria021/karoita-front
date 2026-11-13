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

  it('keeps supervisor reply-status inside bulletins board (not a separate widget)', () => {
    expect(getDashboardWidgets('supervisor_professor')).toEqual([
      { id: 'bulletins', span: 'full' },
    ]);
    expect(getDashboardWidgets('mentor_teacher')).toEqual([
      { id: 'bulletins', span: 'full' },
    ]);
    expect(getDashboardWidgets('school_principal')).toEqual([
      { id: 'bulletins', span: 'full' },
    ]);
  });

  it('keeps senior admin workbench inside bulletins board (no separate widgets)', () => {
    expect(getDashboardWidgets('super_admin')).toEqual([
      { id: 'bulletins', span: 'full' },
    ]);
    expect(getDashboardWidgets('assistant_admin')).toEqual([
      { id: 'bulletins', span: 'full' },
    ]);
  });
});
