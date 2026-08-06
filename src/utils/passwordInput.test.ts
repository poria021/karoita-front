import { describe, expect, it } from 'vitest';

import {
  PASSWORD_MIN_LENGTH,
  containsPersianOrArabicScript,
  stripPersianOrArabicScript,
} from '@/utils/passwordInput';

describe('passwordInput', () => {
  it('exports a single product-wide password floor', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
  });

  it('detects Persian letters and allows latin password characters', () => {
    expect(containsPersianOrArabicScript('سلام')).toBe(true);
    expect(containsPersianOrArabicScript('pass')).toBe(false);
    expect(containsPersianOrArabicScript('P@ssw0rd!')).toBe(false);
    expect(containsPersianOrArabicScript('abسلامcd')).toBe(true);
  });

  it('strips Persian/Arabic script and keeps latin', () => {
    expect(stripPersianOrArabicScript('abسلامcd')).toBe('abcd');
    expect(stripPersianOrArabicScript('P@ss123!')).toBe('P@ss123!');
  });
});
