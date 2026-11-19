import { describe, expect, it } from 'vitest';

import { workbenchLayoutForRole, workbenchSlotById } from '@/lib/workbench-grid';
import type { ReportRow } from '@/types/reports';

import { summarizeFacultyCounts } from '../hooks/useDashboardFacultyCounts';

function row(partial: Partial<ReportRow>): ReportRow {
  return { id: 'x', ...partial } as ReportRow;
}

describe('summarizeFacultyCounts', () => {
  it('اساتید و مدارس را می‌شمارد و جنسیت را تفکیک می‌کند', () => {
    const counts = summarizeFacultyCounts({
      professors: [row({ id: 'p1' }), row({ id: 'p2' }), row({ id: 'p3' })],
      schools: [
        row({ id: 'a', genderLabel: 'پسرانه' }),
        row({ id: 'b', genderLabel: 'دخترانه' }),
        row({ id: 'c', genderLabel: 'دخترانه' }),
        row({ id: 'd' }),
      ],
      learners: 120,
    });
    expect(counts).toEqual({
      professors: 3,
      schools: 4,
      learners: 120,
      boysSchools: 1,
      girlsSchools: 2,
      truncated: false,
    });
  });

  it('لیست خالی همه‌چیز را صفر می‌کند و truncated را نگه می‌دارد', () => {
    expect(
      summarizeFacultyCounts({
        professors: [],
        schools: [],
        learners: 0,
        truncated: true,
      })
    ).toEqual({
      professors: 0,
      schools: 0,
      learners: 0,
      boysSchools: 0,
      girlsSchools: 0,
      truncated: true,
    });
  });
});

describe('faculty workbench layout', () => {
  it('با گزینه، همان هندسهٔ منطقه را برای مدیر دانشکده می‌سازد', () => {
    const slots = workbenchLayoutForRole('faculty_role', {
      showAd: false,
      showRegionalCounts: true,
    });
    expect(workbenchSlotById(slots, 'regional_gender')!.placement).toMatchObject(
      { colSpan: 6, colStart: 7, rowStart: 2, stretch: true }
    );
    expect(
      workbenchSlotById(slots, 'regional_school_ranking')!.placement
    ).toMatchObject({ colSpan: 6, colStart: 1, rowStart: 3 });
    expect(
      workbenchSlotById(slots, 'regional_teacher_ranking')!.placement
    ).toMatchObject({ colSpan: 6, colStart: 7, rowStart: 3 });
    expect(workbenchSlotById(slots, 'regional_counts')!.placement).toMatchObject(
      { colSpan: 12, colStart: 1, rowStart: 4 }
    );
  });

  it('با تبلیغ، آمار داخل سلول تبلیغ می‌آید (includes)', () => {
    const slots = workbenchLayoutForRole('faculty_role', {
      showAd: true,
      showRegionalCounts: true,
    });
    const ad = workbenchSlotById(slots, 'ad')!;
    expect(ad.placement).toMatchObject({
      colStart: 13,
      rowStart: 1,
      rowSpan: 3,
    });
    expect(ad.includes).toEqual(['regional_counts']);
    expect(workbenchSlotById(slots, 'regional_counts')).toBeUndefined();
  });

  it('بدون گزینه، باکس‌های منطقه‌ای اضافه نمی‌شوند', () => {
    const slots = workbenchLayoutForRole('faculty_role', { showAd: false });
    expect(workbenchSlotById(slots, 'regional_counts')).toBeUndefined();
    expect(workbenchSlotById(slots, 'regional_gender')).toBeUndefined();
    expect(workbenchSlotById(slots, 'regional_teacher_ranking')).toBeUndefined();
    expect(workbenchSlotById(slots, 'regional_school_ranking')).toBeUndefined();
  });
});
