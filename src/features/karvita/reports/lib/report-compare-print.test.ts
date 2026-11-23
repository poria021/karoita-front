import { describe, expect, it } from 'vitest';

import { REPORT_COMPARE_PRINT_OPTIONS } from './report-compare-print';

describe('REPORT_COMPARE_PRINT_OPTIONS', () => {
  it('covers table, chart, and both', () => {
    expect(REPORT_COMPARE_PRINT_OPTIONS.map((option) => option.id)).toEqual([
      'table',
      'chart',
      'both',
    ]);
  });
});
