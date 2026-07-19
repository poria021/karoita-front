import { describe, expect, it } from 'vitest';

import {
  orgEntityKindFromTab,
  type OrgStructureSubTab,
} from '@/types/org-structure';

describe('orgEntityKindFromTab', () => {
  it('maps every admin tab to a singular entity kind', () => {
    const cases: Array<[OrgStructureSubTab, string]> = [
      ['provinces', 'province'],
      ['cities', 'city'],
      ['districts', 'district'],
      ['schools', 'school'],
      ['majors', 'major'],
      ['faculties', 'faculty'],
    ];
    for (const [tab, kind] of cases) {
      expect(orgEntityKindFromTab(tab)).toBe(kind);
    }
  });
});
