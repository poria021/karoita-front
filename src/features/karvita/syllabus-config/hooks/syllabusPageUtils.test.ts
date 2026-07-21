import { describe, expect, it } from 'vitest';

import {
  errorMessage,
  offeredCatalogIdsFromList,
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
