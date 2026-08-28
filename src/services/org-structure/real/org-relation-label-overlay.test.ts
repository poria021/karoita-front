import { afterEach, describe, expect, it } from 'vitest';

import {
  overlayOrgRelationLabels,
  rememberOrgRelationLabels,
  resetOrgRelationLabelOverlay,
} from './org-relation-label-overlay';
import type { OrgStructureListItem } from '@/types/org-structure';

function school(partial: Partial<OrgStructureListItem>): OrgStructureListItem {
  return {
    id: 's1',
    name: 'دبستان نمونه',
    kind: 'school',
    deleteBlocked: false,
    ...partial,
  };
}

describe('org relation label overlay', () => {
  afterEach(() => {
    resetOrgRelationLabelOverlay();
  });
  it('fills blank list fields from the labels remembered at submit', () => {
    rememberOrgRelationLabels(['s1', 'دبستان نمونه'], {
      cityName: 'کاشان',
      districtName: 'ناحیه ۱',
    });
    expect(
      overlayOrgRelationLabels(
        school({ cityName: undefined, districtName: undefined })
      )
    ).toMatchObject({
      cityName: 'کاشان',
      districtName: 'ناحیه ۱',
    });
  });

  it('does not overwrite titles that the GET row already has', () => {
    rememberOrgRelationLabels(['s2'], {
      cityName: 'قدیمی',
      districtName: 'قدیمی',
    });
    expect(
      overlayOrgRelationLabels(
        school({
          id: 's2',
          name: 'دیگر',
          cityName: 'کاشان',
          districtName: 'ناحیه ۱',
        })
      )
    ).toMatchObject({
      cityName: 'کاشان',
      districtName: 'ناحیه ۱',
    });
  });
});
