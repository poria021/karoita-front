import { describe, expect, it } from 'vitest';

import { normalizeDailyApprovalScoreInput } from './dailyApprovalScore';

describe('normalizeDailyApprovalScoreInput', () => {
  it('keeps score state in English digits for Persian and Arabic input', () => {
    expect(normalizeDailyApprovalScoreInput('۸۷.۵')).toBe('87.5');
    expect(normalizeDailyApprovalScoreInput('٨٨.٢٥')).toBe('88.25');
  });

  it('removes non-numeric characters and extra decimal separators', () => {
    expect(normalizeDailyApprovalScoreInput('نمره ۹۲..۵۰')).toBe('92.50');
  });
});
