import { describe, expect, it } from 'vitest';

import {
  buildProvinceSelectOptions,
  canonicalizeProvinceTitles,
  normalizeProvinceTitle,
} from './province-select';

describe('province-select', () => {
  it('normalizes arabic yeh/kaf and zwnj', () => {
    expect(normalizeProvinceTitle(`  تهران\u200c `)).toBe('تهران');
    expect(normalizeProvinceTitle('يazd')).toBe('یazd');
    expect(normalizeProvinceTitle('كرمان')).toBe('کرمان');
  });

  it('maps selected titles onto catalog canonical forms', () => {
    const catalog = ['تهران', 'اصفهان', 'فارس'];
    expect(
      canonicalizeProvinceTitles([`تهران\u200c`, 'اصفهان', 'قم'], catalog)
    ).toEqual(['تهران', 'اصفهان', 'قم']);
  });

  it('builds options as catalog plus orphans only', () => {
    const catalog = ['تهران', 'اصفهان'];
    expect(
      buildProvinceSelectOptions(catalog, [`تهران\u200c`, 'یزد'])
    ).toEqual([
      { value: 'تهران', label: 'تهران' },
      { value: 'اصفهان', label: 'اصفهان' },
      { value: 'یزد', label: 'یزد' },
    ]);
  });

  it('treats full catalog selection as complete after canonicalize', () => {
    const catalog = ['تهران', 'اصفهان', 'فارس'];
    const selected = canonicalizeProvinceTitles(
      [`تهران\u200c`, 'اصفهان', 'فارس'],
      catalog
    );
    const options = buildProvinceSelectOptions(catalog, selected);
    const selectedSet = new Set(selected);
    expect(options.every((option) => selectedSet.has(option.value))).toBe(true);
    expect(options.filter((option) => selectedSet.has(option.value))).toHaveLength(
      options.length
    );
  });
});
