import { describe, expect, it } from 'vitest';

import {
  workbenchAllowsAdSpot,
  workbenchCellClass,
  workbenchLayoutForRole,
  workbenchLayoutKindFor,
  workbenchShellClass,
  workbenchSlotById,
} from './workbench-grid';

describe('workbenchLayoutKindFor', () => {
  it('maps roles to layout kinds', () => {
    expect(workbenchLayoutKindFor('student')).toBe('learner');
    expect(workbenchLayoutKindFor('super_admin')).toBe('senior');
    expect(workbenchLayoutKindFor('supervisor_professor')).toBe('evaluation');
    expect(workbenchLayoutKindFor('faculty_role')).toBe('classic');
  });
});

describe('workbenchLayoutForRole', () => {
  it('keeps classic welcome 5 + announcements 7', () => {
    const slots = workbenchLayoutForRole('faculty_role', { showAd: false });
    expect(workbenchSlotById(slots, 'welcome')?.placement).toMatchObject({
      colSpan: 5,
      colStart: 1,
    });
    expect(workbenchSlotById(slots, 'announcements')?.placement).toMatchObject({
      colSpan: 7,
      colStart: 6,
    });
  });

  it('keeps learner announcements 7 | materials 5', () => {
    const slots = workbenchLayoutForRole('student', { showAd: true });
    expect(slots.map((s) => s.id)).toEqual([
      'welcome',
      'announcements',
      'materials',
      'ad',
    ]);
    expect(workbenchSlotById(slots, 'ad')?.placement.rowSpan).toBe(2);
  });

  it('keeps senior as welcome + content band only', () => {
    const slots = workbenchLayoutForRole('super_admin', { showAd: true });
    expect(slots.map((s) => s.id)).toEqual(['welcome', 'senior_band']);
    expect(workbenchAllowsAdSpot('super_admin')).toBe(false);
  });

  it('keeps evaluation 6|6 with capacity under announcements', () => {
    const slots = workbenchLayoutForRole('supervisor_professor', {
      showAd: true,
      showCapacity: true,
    });
    expect(workbenchSlotById(slots, 'announcements')?.placement).toMatchObject({
      colSpan: 6,
      colStart: 1,
      rowStart: 2,
    });
    expect(workbenchSlotById(slots, 'monitor')?.placement).toMatchObject({
      colSpan: 6,
      colStart: 7,
      rowStart: 2,
    });
    expect(workbenchSlotById(slots, 'capacity')?.placement).toMatchObject({
      colSpan: 6,
      colStart: 1,
      rowStart: 3,
    });
    expect(workbenchSlotById(slots, 'ad')?.placement.rowSpan).toBe(2);
  });
});

describe('workbenchCellClass / shell', () => {
  it('emits static utilities', () => {
    expect(
      workbenchCellClass({
        colSpan: 6,
        colStart: 7,
        rowStart: 2,
        rowSpan: 2,
      })
    ).toContain('md:col-span-6');
    expect(workbenchShellClass(true)).toContain('240px');
    expect(workbenchShellClass(false)).toContain('md:grid-cols-12');
  });
});
