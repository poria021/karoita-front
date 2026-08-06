import { describe, expect, it } from 'vitest';

import { adminTableRowNumber } from './adminTableRowNumber';

describe('adminTableRowNumber', () => {
  it('formats 1-based Persian digits from a zero-based index', () => {
    expect(adminTableRowNumber(0)).toBe('۱');
    expect(adminTableRowNumber(9)).toBe('۱۰');
  });

  it('supports a base offset for paged views', () => {
    expect(adminTableRowNumber(0, 10)).toBe('۱۱');
  });
});
