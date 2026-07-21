import { describe, expect, it } from 'vitest';

import { cacheKeyFor } from './syllabusPageCache';

describe('cacheKeyFor', () => {
  it('scopes cache by syllabus section', () => {
    expect(cacheKeyFor('term_settings')).toBe('syllabus-config::term_settings');
    expect(cacheKeyFor('course_offerings')).toBe(
      'syllabus-config::course_offerings'
    );
  });
});
