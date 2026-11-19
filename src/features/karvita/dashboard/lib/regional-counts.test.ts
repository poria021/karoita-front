import { describe, expect, it } from 'vitest';

import { workbenchLayoutForRole, workbenchSlotById } from '@/lib/workbench-grid';
import type { ReportRow } from '@/types/reports';

import { summarizeRegionalCounts } from '../hooks/useDashboardRegionalCounts';

function row(partial: Partial<ReportRow>): ReportRow {
  return { id: 'x', ...partial } as ReportRow;
}

describe('summarizeRegionalCounts', () => {
  it('مدارس را می‌شمارد و معلمان/فراگیران را جمع می‌زند', () => {
    const counts = summarizeRegionalCounts([
      row({ id: 'a', nT: 4, n: 60, genderLabel: 'پسرانه' }),
      row({ id: 'b', nT: 2, n: 25, genderLabel: 'دخترانه' }),
      row({ id: 'c', genderLabel: 'دخترانه' }),
      row({ id: 'd' }),
    ]);
    expect(counts).toEqual({
      schools: 4,
      teachers: 6,
      learners: 85,
      boysSchools: 1,
      girlsSchools: 2,
      truncated: false,
    });
  });

  it('لیست خالی همه‌چیز را صفر می‌کند و truncated را نگه می‌دارد', () => {
    expect(summarizeRegionalCounts([], true)).toEqual({
      schools: 0,
      teachers: 0,
      learners: 0,
      boysSchools: 0,
      girlsSchools: 0,
      truncated: true,
    });
  });
});

describe('regional workbench layout', () => {
  it('با گزینه، «تفکیک مدارس» نیمهٔ دیگر ردیف دوم کنار اطلاعیه‌هاست', () => {
    const slots = workbenchLayoutForRole('regional_edu_admin', {
      showAd: false,
      showRegionalCounts: true,
    });
    const gender = workbenchSlotById(slots, 'regional_gender')!.placement;
    expect(gender).toMatchObject({ colSpan: 6, colStart: 7, rowStart: 2 });
  });

  it('«آمار منطقه» ردیف چهارم و تمام‌عرض است', () => {
    const slots = workbenchLayoutForRole('regional_edu_admin', {
      showAd: false,
      showRegionalCounts: true,
    });
    const counts = workbenchSlotById(slots, 'regional_counts')!.placement;
    expect(counts).toMatchObject({ colSpan: 12, colStart: 1, rowStart: 4 });
  });

  it('«معلمان منطقه» ردیف سوم کنار «مدارس ضعیف/قوی» است', () => {
    const slots = workbenchLayoutForRole('regional_edu_admin', {
      showAd: false,
      showRegionalCounts: true,
    });
    const schools = workbenchSlotById(slots, 'regional_school_ranking')!
      .placement;
    const teachers = workbenchSlotById(slots, 'regional_teacher_ranking')!
      .placement;
    expect(teachers).toMatchObject({ colSpan: 6, colStart: 7, rowStart: 3 });
    expect(schools).toMatchObject({ colSpan: 6, colStart: 1, rowStart: 3 });
  });

  it('«مدارس ضعیف/قوی» ردیف سوم و نیمه‌عرض است', () => {
    const slots = workbenchLayoutForRole('regional_edu_admin', {
      showAd: false,
      showRegionalCounts: true,
    });
    const schools = workbenchSlotById(slots, 'regional_school_ranking')!
      .placement;
    expect(schools).toMatchObject({ colSpan: 6, colStart: 1, rowStart: 3 });
  });

  it('بدون گزینه، باکس اضافه نمی‌شود', () => {
    const slots = workbenchLayoutForRole('regional_edu_admin', {
      showAd: false,
    });
    expect(workbenchSlotById(slots, 'regional_counts')).toBeUndefined();
    expect(workbenchSlotById(slots, 'regional_gender')).toBeUndefined();
    expect(workbenchSlotById(slots, 'regional_teacher_ranking')).toBeUndefined();
    expect(workbenchSlotById(slots, 'regional_school_ranking')).toBeUndefined();
  });
});

describe('regional workbench ad column', () => {
  it('تبلیغ ردیف‌های ۱–۲ را می‌گیرد تا زیر خوش‌آمد فاصلهٔ خالی نیفتد', () => {
    const slots = workbenchLayoutForRole('regional_edu_admin', {
      showAd: true,
      showRegionalCounts: true,
    });
    expect(workbenchSlotById(slots, 'ad')!.placement).toMatchObject({
      colStart: 13,
      rowStart: 1,
      rowSpan: 2,
    });
  });
});

describe('regional counts in the ad track', () => {
  const layout = () =>
    workbenchLayoutForRole('regional_edu_admin', {
      showAd: true,
      showRegionalCounts: true,
    });

  it('با تبلیغ، سه کارت زیر هم در ترک تبلیغ و ردیف ۳ (زیر تبلیغ) می‌نشینند', () => {
    const slots = layout();
    const ad = workbenchSlotById(slots, 'ad')!.placement;
    const counts = workbenchSlotById(slots, 'regional_counts')!.placement;
    expect(counts).toMatchObject({ colSpan: 1, colStart: 13, rowStart: 3 });
    expect(counts.rowStart).toBe((ad.rowStart ?? 1) + (ad.rowSpan ?? 1));
  });

  it('روی هیچ باکسی نمی‌افتد', () => {
    const slots = layout();
    const box = (s: (typeof slots)[number]) => {
      const r0 = s.placement.rowStart ?? 1;
      const c0 = s.placement.colStart ?? 1;
      return [r0, r0 + (s.placement.rowSpan ?? 1), c0, c0 + s.placement.colSpan];
    };
    for (const a of slots) {
      for (const b of slots) {
        if (a === b) continue;
        const [r0, r1, c0, c1] = box(a);
        const [o0, o1, p0, p1] = box(b);
        expect(
          r0 < o1 && o0 < r1 && c0 < p1 && p0 < c1,
          `${a.id} overlaps ${b.id}`
        ).toBe(false);
      }
    }
  });
});

describe('regional row 2: announcements and school gender share one height', () => {
  const regional = () =>
    workbenchLayoutForRole('regional_edu_admin', {
      showAd: true,
      showRegionalCounts: true,
    });

  it('هر دو باکس stretch هستند و هیچ‌کدام ارتفاع ثابت ندارند', () => {
    const slots = regional();
    const announcements = workbenchSlotById(slots, 'announcements')!.placement;
    const gender = workbenchSlotById(slots, 'regional_gender')!.placement;
    expect(announcements).toMatchObject({ rowStart: 2, stretch: true });
    expect(gender).toMatchObject({ rowStart: 2, stretch: true });
    expect(announcements.height).toBeUndefined();
    expect(gender.height).toBeUndefined();
  });

  it('نقش‌های دیگر classic ارتفاع ثابت اطلاعیه‌ها را نگه می‌دارند', () => {
    const slots = workbenchLayoutForRole('central_organization', {
      showAd: true,
    });
    expect(workbenchSlotById(slots, 'announcements')!.placement).toMatchObject({
      height: 'learnerAnnounce',
    });
  });
});
