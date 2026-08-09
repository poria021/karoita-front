import { describe, expect, it } from 'vitest';

import {
  applyPersianTextScriptGuard,
  containsLatinLetters,
  isPersianPersonName,
  stripLatinLetters,
  stripNonPersianPersonNameChars,
} from '@/utils/persianPersonName';

describe('isPersianPersonName', () => {
  it('accepts Persian names with space and ZWNJ', () => {
    expect(isPersianPersonName('امیرحسین')).toBe(true);
    expect(isPersianPersonName('سید علی')).toBe(true);
    expect(isPersianPersonName('امیر\u200cحسین')).toBe(true);
  });

  it('rejects Latin letters', () => {
    expect(isPersianPersonName('Ali')).toBe(false);
    expect(isPersianPersonName('علی Ali')).toBe(false);
    expect(isPersianPersonName('aعلی')).toBe(false);
  });

  it('rejects digits and punctuation', () => {
    expect(isPersianPersonName('علی2')).toBe(false);
    expect(isPersianPersonName('علی-رضایی')).toBe(false);
    expect(isPersianPersonName('')).toBe(false);
  });
});

describe('latin letter helpers', () => {
  it('detects and strips Latin letters', () => {
    expect(containsLatinLetters('علیAli')).toBe(true);
    expect(containsLatinLetters('علی ۲')).toBe(false);
    expect(stripLatinLetters('علیAli123')).toBe('علی123');
  });

  it('applyPersianTextScriptGuard no-latin keeps digits', () => {
    const result = applyPersianTextScriptGuard('عنوان A1', 'no-latin');
    expect(result).toEqual({ value: 'عنوان 1', blockedLatin: true });
  });

  it('applyPersianTextScriptGuard persian-name strips digits too', () => {
    const result = applyPersianTextScriptGuard('علیA2', 'persian-name');
    expect(result).toEqual({ value: 'علی', blockedLatin: true });
  });
});

describe('stripNonPersianPersonNameChars', () => {
  it('removes Latin while keeping Persian and ZWNJ', () => {
    expect(stripNonPersianPersonNameChars('علیAli')).toBe('علی');
    expect(stripNonPersianPersonNameChars('امیر\u200cحسینabc')).toBe(
      'امیر\u200cحسین'
    );
  });

  it('removes digits and punctuation', () => {
    expect(stripNonPersianPersonNameChars('سید علی! 12')).toBe('سید علی ');
  });
});
