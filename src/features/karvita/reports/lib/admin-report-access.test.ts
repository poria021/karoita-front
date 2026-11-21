import { describe, expect, it } from 'vitest';

import { adminReportsMenuGroupsFromMe } from './admin-report-access';
import { reportPath } from './report-path';

describe('adminReportsMenuGroupsFromMe', () => {
  it('returns null while /me is still loading', () => {
    expect(adminReportsMenuGroupsFromMe(null, ['attendance'])).toBeNull();
  });

  it('hides reports absent from /me and disables inactive ones', () => {
    const groups = adminReportsMenuGroupsFromMe(
      ['learners', 'teachers'],
      ['attendance', 'learners']
    );
    expect(groups).not.toBeNull();
    const items = groups!.flatMap((g) => g.children);
    expect(items.map((i) => i.path)).toEqual([
      reportPath('learners'),
      reportPath('teachers'),
      reportPath('attendance'),
    ]);
    expect(items.find((i) => i.path === reportPath('learners'))?.disabled).toBeUndefined();
    expect(items.find((i) => i.path === reportPath('teachers'))?.disabled).toBeUndefined();
    expect(items.find((i) => i.path === reportPath('attendance'))?.disabled).toBe(
      true
    );
    expect(items.some((i) => i.path === reportPath('schools'))).toBe(false);
  });

  it('returns empty groups when /me has no reports', () => {
    expect(adminReportsMenuGroupsFromMe([])).toEqual([]);
  });
});
