import { describe, expect, it } from 'vitest';

import { getAdminTableBodyPhase } from './adminTableBodyPhase';

describe('getAdminTableBodyPhase', () => {
  it('prefers rows when items exist even if loading', () => {
    expect(getAdminTableBodyPhase(true, 3)).toBe('rows');
  });

  it('is busy on first load with no items', () => {
    expect(getAdminTableBodyPhase(true, 0)).toBe('busy');
  });

  it('is empty when idle with no items', () => {
    expect(getAdminTableBodyPhase(false, 0)).toBe('empty');
  });

  it('is rows when idle with items', () => {
    expect(getAdminTableBodyPhase(false, 2)).toBe('rows');
  });
});
