import { describe, expect, it } from 'vitest';

import { cacheKeyFor, syllabusSnapshotQueryKey, type PendingNavigation } from './syllabusPageCache';
import type { CourseCatalogItem } from '@/types/syllabus-config';

describe('cacheKeyFor', () => {
  it('scopes cache by syllabus section', () => {
    expect(cacheKeyFor('term_settings')).toBe('syllabus-config::term_settings');
    expect(cacheKeyFor('course_offerings')).toBe(
      'syllabus-config::course_offerings'
    );
  });
});

describe('syllabusSnapshotQueryKey', () => {
  it('is shared by term settings and course offerings', () => {
    expect(syllabusSnapshotQueryKey).toEqual(['syllabus-config', 'snapshot']);
  });
});

describe('PendingNavigation hydrate shape', () => {
  it('accepts term and course variants used by unsaved guard', () => {
    const termPending: PendingNavigation = {
      kind: 'term',
      termId: 'term-1',
    };
    const course: CourseCatalogItem = {
      id: 'c1',
      title: 'کارورزی',
      type: 'internship',
    };
    const coursePending: PendingNavigation = {
      kind: 'course',
      course,
    };
    expect(termPending.kind).toBe('term');
    expect(coursePending.kind).toBe('course');
  });
});
