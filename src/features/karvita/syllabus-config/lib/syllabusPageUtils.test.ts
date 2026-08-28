import { describe, expect, it } from 'vitest';

import {
  errorMessage,
  offeredCatalogIdsFromList,
  resolveAudienceTermId,
} from './syllabusPageUtils';

describe('errorMessage', () => {
  it('returns Error.message when present', () => {
    expect(errorMessage(new Error('سرویس قطع است'), 'fallback')).toBe(
      'سرویس قطع است'
    );
  });

  it('falls back for non-Error and empty message', () => {
    expect(errorMessage('x', 'بارگذاری ناموفق بود.')).toBe(
      'بارگذاری ناموفق بود.'
    );
    expect(errorMessage(new Error(''), 'بارگذاری ناموفق بود.')).toBe(
      'بارگذاری ناموفق بود.'
    );
  });
});

describe('offeredCatalogIdsFromList', () => {
  it('collects only offered catalog ids', () => {
    const ids = offeredCatalogIdsFromList([
      {
        courseOfferingId: 'o1',
        courseCatalogId: 'c1',
        isOffered: true,
        title: 'A',
        type: 'internship',
      },
      {
        courseOfferingId: null,
        courseCatalogId: 'c2',
        isOffered: false,
        title: 'B',
        type: 'apprenticeship',
      },
      {
        courseOfferingId: 'o3',
        courseCatalogId: 'c3',
        isOffered: true,
        title: 'C',
        type: 'internship',
      },
    ]);
    expect([...ids].sort()).toEqual(['c1', 'c3']);
  });
});

describe('resolveAudienceTermId', () => {
  const pool = [
    {
      id: 'term_mod_1',
      title: 'پودمان اول 1405-1406',
      type: 'modular' as const,
      isEnrollOpen: false,
      isTermOpen: false,
      enrollStart: '',
      termStart: '',
    },
    {
      id: 'term_mod_2',
      title: 'پودمان دوم 1405-1406',
      type: 'modular' as const,
      isEnrollOpen: false,
      isTermOpen: false,
      enrollStart: '',
      termStart: '',
    },
  ];

  it('restores the remembered term when it still exists in the audience pool', () => {
    expect(resolveAudienceTermId(pool, 'term_mod_2')).toBe('term_mod_2');
  });

  it('falls back to the first term when memory is empty or stale', () => {
    expect(resolveAudienceTermId(pool, undefined)).toBe('term_mod_1');
    expect(resolveAudienceTermId(pool, 'term_gone')).toBe('term_mod_1');
    expect(resolveAudienceTermId([], 'term_mod_1')).toBe('');
  });
});
