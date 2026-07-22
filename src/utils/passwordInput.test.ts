import { describe, expect, it } from 'vitest';

import {
  containsPersianOrArabicScript,
  stripPersianOrArabicScript,
} from '@/utils/passwordInput';

describe('passwordInput', () => {
  it('detects Persian letters', () => {
    expect(containsPersianOrArabicScript('سلام')).toBe(true);
    expect(containsPersianOrArabicScript('pass')).toBe(false);
  });

  it('strips Persian/Arabic script and keeps latin', () => {
    expect(stripPersianOrArabicScript('abسلامcd')).toBe('abcd');
    expect(stripPersianOrArabicScript('P@ss123!')).toBe('P@ss123!');
  });
});
