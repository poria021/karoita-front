import { describe, expect, it } from 'vitest';

import type { CourseCatalogItem } from '@/types/syllabus-config';

import {
  decideUnsavedCourseSelect,
  decideUnsavedTermSelect,
  pendingCourseNavigation,
  pendingTermNavigation,
} from './syllabusUnsavedNav';

const course = (id: string): CourseCatalogItem => ({
  id,
  title: `Course ${id}`,
  type: 'internship',
});

describe('decideUnsavedTermSelect', () => {
  it('noops when term is already selected', () => {
    expect(decideUnsavedTermSelect('t1', 't1', true)).toBe('noop');
    expect(decideUnsavedTermSelect('t1', 't1', false)).toBe('noop');
  });

  it('defers when unsaved edits exist', () => {
    expect(decideUnsavedTermSelect('t2', 't1', true)).toBe('defer');
  });

  it('commits when clean', () => {
    expect(decideUnsavedTermSelect('t2', 't1', false)).toBe('commit');
  });
});

describe('decideUnsavedCourseSelect', () => {
  it('noops when course is already selected', () => {
    expect(decideUnsavedCourseSelect('c1', 'c1', true)).toBe('noop');
  });

  it('defers when unsaved edits exist', () => {
    expect(decideUnsavedCourseSelect('c2', 'c1', true)).toBe('defer');
  });

  it('commits when clean', () => {
    expect(decideUnsavedCourseSelect('c2', 'c1', false)).toBe('commit');
    expect(decideUnsavedCourseSelect('c2', undefined, false)).toBe('commit');
  });
});

describe('pending navigation builders', () => {
  it('builds term and course pending payloads', () => {
    expect(pendingTermNavigation('term-9')).toEqual({
      kind: 'term',
      termId: 'term-9',
    });
    const item = course('cat-1');
    expect(pendingCourseNavigation(item)).toEqual({
      kind: 'course',
      course: item,
    });
  });
});
