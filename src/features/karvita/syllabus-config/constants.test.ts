import { describe, expect, it } from 'vitest';

import { formatTermOptionLabel, parseTermTitleParts } from './constants';

describe('syllabus-config term title helpers', () => {
  it('parses prefix and academic year from stored title', () => {
    expect(parseTermTitleParts('نیم‌سال اول 1405-1406')).toEqual({
      prefix: 'نیم‌سال اول',
      academicYear: '1405-1406',
    });
  });

  it('formats course-offerings option as عنوان بازه · سال تحصیلی', () => {
    expect(formatTermOptionLabel('نیم‌سال اول 1405-1406')).toBe(
      'نیم‌سال اول · ۱۴۰۵-۱۴۰۶'
    );
    expect(formatTermOptionLabel('کارآموزی 1 1404-1405')).toBe(
      'کارآموزی ۱ · ۱۴۰۴-۱۴۰۵'
    );
  });
});
