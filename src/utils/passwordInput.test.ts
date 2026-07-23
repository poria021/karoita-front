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

  it('detects Persian letters', () => {
    expect(containsPersianOrArabicScript('سلام')).toBe(true);
    expect(containsPersianOrArabicScript('pass')).toBe(false);
  });

  it('strips Persian/Arabic script and keeps latin', () => {
    expect(stripPersianOrArabicScript('abسلامcd')).toBe('abcd');
    expect(stripPersianOrArabicScript('P@ss123!')).toBe('P@ss123!');
  });
});
