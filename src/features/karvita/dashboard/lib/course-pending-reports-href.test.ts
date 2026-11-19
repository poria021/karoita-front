import { describe, expect, it } from 'vitest';

import type { CourseDefinition } from '@/types/syllabus-config';

import {
  dailyApprovalsCourseHref,
  findEvaluationModuleId,
} from './course-pending-reports-href';

function course(
  id: string,
  isActive: boolean,
  subIds: string[] = []
): CourseDefinition {
  return {
    id,
    isActive,
    subModules: subIds.map((subId) => ({ id: subId })),
  } as unknown as CourseDefinition;
}

function params(href: string) {
  return new URL(href, 'http://localhost').searchParams;
}

describe('dailyApprovalsCourseHref', () => {
  it('points at the daily approvals page of the right kind', () => {
    const href = dailyApprovalsCourseHref({ kind: 'apprenticeship' });
    expect(href).toContain('daily-approvals');
    expect(params(href).get('kind')).toBe('apprenticeship');
    expect(params(href).has('module')).toBe(false);
    expect(params(href).has('course')).toBe(false);
  });

  it('adds the module and the course filter when known', () => {
    const href = dailyApprovalsCourseHref({
      kind: 'internship',
      moduleId: 'm1',
      courseKey: 'intern2',
    });
    expect(params(href).get('kind')).toBe('internship');
    expect(params(href).get('module')).toBe('m1');
    expect(params(href).get('course')).toBe('intern2');
  });
});

describe('findEvaluationModuleId', () => {
  const catalog = {
    semester: [course('s1', false), course('s2', true, ['s2-a', 's2-b'])],
    modular: [course('m1', true)],
  };

  it('finds the parent module of a sub module key', () => {
    expect(findEvaluationModuleId('s2-b', 'internship', catalog)).toBe('s2');
  });

  it('matches a course used directly as the key', () => {
    expect(findEvaluationModuleId('m1', 'apprenticeship', catalog)).toBe('m1');
  });

  it('falls back to the first active module of that kind', () => {
    expect(findEvaluationModuleId('unknown', 'internship', catalog)).toBe('s2');
  });

  it('returns null when that kind has no modules at all', () => {
    expect(
      findEvaluationModuleId('x', 'internship', { semester: [], modular: [] })
    ).toBeNull();
  });
});
