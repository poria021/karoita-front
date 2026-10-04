import { describe, expect, it } from 'vitest';

import {
  findLessonForLevel,
  lessonMatchesLevel,
  strictLessonLevelFromTitle,
} from './lesson-matching';

describe('strictLessonLevelFromTitle', () => {
  it('reads the standalone level number, Persian or Latin', () => {
    expect(strictLessonLevelFromTitle('کارورزی ۲')).toBe(2);
    expect(strictLessonLevelFromTitle('Internship 3')).toBe(3);
  });

  it('ignores year digits instead of reading 1 out of 1404', () => {
    expect(strictLessonLevelFromTitle('کارورزی ۱۴۰۴')).toBeNull();
    expect(strictLessonLevelFromTitle('کارورزی ۲ (۱۴۰۴-۱۴۰۵)')).toBe(2);
  });

  it('returns null for a title without a level, not level 1', () => {
    expect(strictLessonLevelFromTitle('کارورزی')).toBeNull();
  });
});

describe('lessonMatchesLevel', () => {
  it('requires both the kind and the level to match', () => {
    expect(lessonMatchesLevel({ title: 'کارورزی ۲' }, 'internship', 2)).toBe(true);
    expect(lessonMatchesLevel({ title: 'کارآموزی ۲' }, 'internship', 2)).toBe(false);
    expect(lessonMatchesLevel({ title: 'کارورزی' }, 'internship', 1)).toBe(false);
  });

  it('does not pick a levelless lesson for level 1', () => {
    const lessons = [{ title: 'کارورزی' }, { title: 'کارورزی ۱' }];
    expect(findLessonForLevel(lessons, 'internship', 1)).toBe(lessons[1]);
  });
});
