import { describe, expect, it } from 'vitest';

import {
  persianToEnglishDigits,
  toPersianDigits,
} from '@/utils/persianDigits';

describe('persianToEnglishDigits', () => {
  it('normalizes Persian digits to ASCII', () => {
    expect(persianToEnglishDigits('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
  });

  it('normalizes Arabic-Indic digits to ASCII', () => {
    expect(persianToEnglishDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
  });

  it('leaves English digits unchanged', () => {
    expect(persianToEnglishDigits('0912')).toBe('0912');
  });

  it('handles mixed scripts in one string', () => {
    expect(persianToEnglishDigits('۰۹12٣')).toBe('09123');
  });

  it('returns empty string for nullish', () => {
    expect(persianToEnglishDigits(null)).toBe('');
    expect(persianToEnglishDigits(undefined)).toBe('');
  });
});

describe('toPersianDigits', () => {
  it('converts English digits for display only', () => {
    expect(toPersianDigits('12345')).toBe('۱۲۳۴۵');
  });

  it('accepts numbers', () => {
    expect(toPersianDigits(42)).toBe('۴۲');
  });

  it('returns empty string for nullish', () => {
    expect(toPersianDigits(null)).toBe('');
    expect(toPersianDigits(undefined)).toBe('');
  });
});
