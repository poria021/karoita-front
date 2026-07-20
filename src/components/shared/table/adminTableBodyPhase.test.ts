import { describe, expect, it } from 'vitest';

import { getAdminTableBodyPhase } from './adminTableBodyPhase';

describe('getAdminTableBodyPhase', () => {
  it('keeps rows during soft refresh when content already exists', () => {
    expect(getAdminTableBodyPhase(true, 3)).toBe('rows');
  });

  it('uses busy on first load with no rows', () => {
    expect(getAdminTableBodyPhase(true, 0)).toBe('busy');
  });

  it('uses empty only when idle and no rows', () => {
    expect(getAdminTableBodyPhase(false, 0)).toBe('empty');
  });

  it('uses rows when idle with data', () => {
    expect(getAdminTableBodyPhase(false, 2)).toBe('rows');
  });
});
