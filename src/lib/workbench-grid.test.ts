import { describe, expect, it } from 'vitest';

import {
  WORKBENCH_FULL_BLEED_ROW_CLASS,
  WORKBENCH_LEARNER_GRADES_INNER_CLASS,
  workbenchAllowsAdSpot,
  workbenchCellClass,
  workbenchLayoutForRole,
  workbenchLayoutKindFor,
  workbenchShellClass,
  workbenchSlotById,
  type WorkbenchBoxSlot,
} from './workbench-grid';

/** ستون‌هایی که یک اسلات اشغال می‌کند، به‌صورت بازهٔ [شروع، پایان). */
function span(slot: WorkbenchBoxSlot): [number, number] {
  const start = slot.placement.colStart ?? 1;
  return [start, start + slot.placement.colSpan];
}

describe('workbenchLayoutKindFor', () => {
  it('maps roles to layout kinds', () => {
    expect(workbenchLayoutKindFor('student')).toBe('learner');
    expect(workbenchLayoutKindFor('super_admin')).toBe('senior');
    expect(workbenchLayoutKindFor('supervisor_professor')).toBe('evaluation');
    expect(workbenchLayoutKindFor('faculty_role')).toBe('classic');
  });
});

describe('workbenchLayoutForRole', () => {
  it('keeps classic welcome full-width then announcements half-width below', () => {
    const slots = workbenchLayoutForRole('faculty_role', { showAd: false });
    expect(workbenchSlotById(slots, 'welcome')?.placement).toMatchObject({
      colSpan: 12,
      colStart: 1,
      rowStart: 1,
      height: 'welcome',
    });
    expect(workbenchSlotById(slots, 'announcements')?.placement).toMatchObject({
      colSpan: 6,
      colStart: 1,
      rowStart: 2,
      height: 'learnerAnnounce',
    });
  });

  it('puts classic ad beside welcome without stretching welcome height', () => {
    const slots = workbenchLayoutForRole('provincial_university', {
      showAd: true,
    });
    expect(workbenchSlotById(slots, 'welcome')?.placement).toMatchObject({
      colSpan: 12,
      rowStart: 1,
      height: 'welcome',
    });
    // تبلیغ ردیف ۱–۲ را می‌گیرد تا ردیف اول به‌خاطر بلندیِ تبلیغ کش نیاید.
    expect(workbenchSlotById(slots, 'ad')?.placement).toMatchObject({
      colStart: 13,
      rowStart: 1,
      rowSpan: 2,
    });
    expect(workbenchSlotById(slots, 'announcements')?.placement.rowStart).toBe(
      2
    );
  });

  it('central_organization بدون تبلیغ مثل دانشگاه استانی چیده می‌شود', () => {
    const central = workbenchLayoutForRole('central_organization', {
      showAd: false,
    });
    const provincial = workbenchLayoutForRole('provincial_university', {
      showAd: false,
    });
    expect(central).toEqual(provincial);
    expect(workbenchSlotById(central, 'senior_weak_ranking')).toBeUndefined();
  });

  it('central_organization با تبلیغ: خوش‌آمد تمام‌عرض و تبلیغ زیرش، بدون آمار/نمره', () => {
    const slots = workbenchLayoutForRole('central_organization', {
      showAd: true,
      showRegionalCounts: true,
    });
    expect(workbenchSlotById(slots, 'welcome')?.placement).toMatchObject({
      fullBleed: true,
      rowStart: 1,
      height: 'welcome',
    });
    const ad = workbenchSlotById(slots, 'ad');
    expect(ad?.placement).toMatchObject({
      colStart: 13,
      rowStart: 2,
      rowSpan: 2,
    });
    expect(ad?.includes).toBeUndefined();
    expect(workbenchSlotById(slots, 'regional_counts')).toBeUndefined();
  });

  it('تمام‌عرض (fullBleed) ستون تبلیغ را هم می‌گیرد', () => {
    const cls = workbenchCellClass({ colSpan: 12, colStart: 1, fullBleed: true });
    expect(cls).toContain('md:col-span-full');
    expect(cls).not.toContain('md:col-span-12');
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

  it('lays senior out as a three-row 12-col bento in DOM (mobile) order', () => {
    const slots = workbenchLayoutForRole('super_admin', { showAd: true });
    expect(slots.map((s) => s.id)).toEqual([
      'welcome',
      'senior_queue',
      'senior_donut',
      'senior_org_counts',
      'senior_role_counts',
      'senior_report_access',
      'senior_published',
    ]);
    expect(workbenchAllowsAdSpot('super_admin')).toBe(false);
    expect(workbenchSlotById(slots, 'announcements')).toBeUndefined();
  });

  it('fills senior row 2 exactly: queue 4 | donut 5 | org counts 3', () => {
    const slots = workbenchLayoutForRole('super_admin', { showAd: false });
    const queue = workbenchSlotById(slots, 'senior_queue')!.placement;
    const donut = workbenchSlotById(slots, 'senior_donut')!.placement;
    const org = workbenchSlotById(slots, 'senior_org_counts')!.placement;

    expect(queue).toMatchObject({ colSpan: 4, colStart: 1, rowStart: 2 });
    expect(donut).toMatchObject({ colSpan: 5, colStart: 5, rowStart: 2 });
    expect(org).toMatchObject({ colSpan: 3, colStart: 10, rowStart: 2 });
    expect(donut.colSpan).toBeGreaterThan(queue.colSpan);
    expect(queue.colSpan).toBeGreaterThan(org.colSpan);
  });

  it('puts the role counts right under the org counts, same columns', () => {
    const slots = workbenchLayoutForRole('super_admin', { showAd: false });
    const org = workbenchSlotById(slots, 'senior_org_counts')!.placement;
    const roles = workbenchSlotById(slots, 'senior_role_counts')!.placement;

    expect(roles.colStart).toBe(org.colStart);
    expect(roles.colSpan).toBe(org.colSpan);
    expect(roles.rowStart).toBe((org.rowStart ?? 0) + (org.rowSpan ?? 1));
  });

  it('puts report access right under the donut, same columns', () => {
    const slots = workbenchLayoutForRole('super_admin', { showAd: false });
    const donut = workbenchSlotById(slots, 'senior_donut')!.placement;
    const access = workbenchSlotById(slots, 'senior_report_access')!.placement;

    expect(access.colStart).toBe(donut.colStart);
    expect(access.colSpan).toBe(donut.colSpan);
    expect(access.rowStart).toBe((donut.rowStart ?? 0) + (donut.rowSpan ?? 1));
  });

  it('no longer shows the weak ranking or the site content box for senior', () => {
    const slots = workbenchLayoutForRole('super_admin', { showAd: false });
    expect(workbenchSlotById(slots, 'senior_weak_ranking')).toBeUndefined();
    expect(slots.map((s) => s.id as string)).not.toContain(
      'senior_site_content'
    );
  });

  it('puts the published announcements right under the review queue, same columns', () => {
    const slots = workbenchLayoutForRole('super_admin', { showAd: false });
    const queue = workbenchSlotById(slots, 'senior_queue')!.placement;
    const published = workbenchSlotById(slots, 'senior_published')!.placement;
    expect(published.colStart).toBe(queue.colStart);
    expect(published.colSpan).toBe(queue.colSpan);
    expect(published.rowStart).toBe(
      (queue.rowStart ?? 0) + (queue.rowSpan ?? 1)
    );
  });

  it('fills senior rows 2 and 3 exactly to 12 columns with no gap or overlap', () => {
    const slots = workbenchLayoutForRole('super_admin', { showAd: false });
    for (const row of [2, 3]) {
      const inRow = slots
        .filter((s) => s.placement.rowStart === row)
        .map(span)
        .sort((a, b) => a[0] - b[0]);
      expect(inRow.length).toBeGreaterThan(0);
      expect(inRow[0][0]).toBe(1);
      expect(inRow[inRow.length - 1][1]).toBe(13);
      for (let i = 1; i < inRow.length; i += 1) {
        expect(inRow[i][0]).toBe(inRow[i - 1][1]);
      }
    }
  });

  it('keeps senior row 3 overlap-free and flush to the right edge (queue only takes row 2)', () => {
    const slots = workbenchLayoutForRole('super_admin', { showAd: false });
    const inRow = slots
      .filter((s) => s.placement.rowStart === 3)
      .map(span)
      .sort((a, b) => a[0] - b[0]);
    expect(inRow.length).toBeGreaterThan(0);
    expect(inRow[inRow.length - 1][1]).toBe(13);
    for (let i = 1; i < inRow.length; i += 1) {
      expect(inRow[i][0]).toBe(inRow[i - 1][1]);
    }
  });

  it('stretches every cell of senior row 3 so the row is equal height', () => {
    const slots = workbenchLayoutForRole('super_admin', { showAd: false });
    for (const slot of slots) {
      if ((slot.placement.rowStart ?? 0) >= 3) {
        expect(slot.placement.stretch).toBe(true);
      }
    }
  });

  it('evaluation: announcements span the full row 2 and learner counts sit under the ad', () => {
    const slots = workbenchLayoutForRole('supervisor_professor', {
      showAd: true,
    });
    expect(workbenchSlotById(slots, 'announcements')?.placement).toMatchObject({
      colSpan: 12,
      colStart: 1,
      rowStart: 2,
    });
    expect(workbenchSlotById(slots, 'capacity' as never)).toBeUndefined();
    const ad = workbenchSlotById(slots, 'ad')!.placement;
    const counts = workbenchSlotById(slots, 'learner_counts')!.placement;
    // ترک ۱۳ام = تبلیغ؛ کارت‌های تعداد فراگیران درست زیر تبلیغ.
    expect(counts).toMatchObject({ colSpan: 1, colStart: 13 });
    expect(counts.colStart).toBe(ad.colStart);
    expect(counts.rowStart).toBe((ad.rowStart ?? 0) + (ad.rowSpan ?? 1));
    expect(ad.rowSpan).toBe(2);
  });

  it('without an ad the learner counts fall back beside the announcements (no stray 13th column)', () => {
    const slots = workbenchLayoutForRole('supervisor_professor', {
      showAd: false,
    });
    expect(workbenchSlotById(slots, 'announcements')?.placement).toMatchObject({
      colSpan: 6,
      colStart: 1,
      rowStart: 2,
    });
    expect(workbenchSlotById(slots, 'learner_counts')?.placement).toMatchObject(
      {
        colSpan: 6,
        colStart: 7,
        rowStart: 2,
      }
    );
  });

  it('with an ad the course averages sit beside the announcements (half each) over rows 2-3', () => {
    const slots = workbenchLayoutForRole('supervisor_professor', {
      showAd: true,
      showCourseAverages: true,
    });
    expect(workbenchSlotById(slots, 'announcements')?.placement).toMatchObject({
      colSpan: 6,
      colStart: 1,
      rowStart: 2,
    });
    expect(
      workbenchSlotById(slots, 'course_averages')?.placement
    ).toMatchObject({ colSpan: 6, colStart: 7, rowStart: 2, rowSpan: 2 });
  });

  it('places the course capacities box without overlapping anything (supervisor professor)', () => {
    const cases = [
      { showAd: true, showCourseAverages: true },
      { showAd: true, showCourseAverages: false },
      { showAd: false, showCourseAverages: true },
      { showAd: false, showCourseAverages: false },
    ];
    for (const options of cases) {
      const slots = workbenchLayoutForRole('supervisor_professor', {
        ...options,
        showCourseCapacities: true,
      });
      const box = workbenchSlotById(slots, 'course_capacities')!;
      const rows = (slot: WorkbenchBoxSlot) => {
        const start = slot.placement.rowStart ?? 1;
        return [start, start + (slot.placement.rowSpan ?? 1)];
      };
      const [boxStart, boxEnd] = rows(box);
      for (const other of slots) {
        if (other === box) continue;
        const [oStart, oEnd] = rows(other);
        const [c0, c1] = span(box);
        const [o0, o1] = span(other);
        const rowsOverlap = boxStart < oEnd && oStart < boxEnd;
        const colsOverlap = c0 < o1 && o0 < c1;
        expect(rowsOverlap && colsOverlap, `${other.id} overlaps`).toBe(false);
      }
    }
    const without = workbenchLayoutForRole('supervisor_professor', {
      showAd: false,
    });
    expect(workbenchSlotById(without, 'course_capacities')).toBeUndefined();
  });

  it('puts the student grade ranking right under the announcements, never overlapping', () => {
    for (const showAd of [true, false]) {
      const slots = workbenchLayoutForRole('supervisor_professor', {
        showAd,
        showCourseAverages: true,
        showCourseCapacities: true,
        showCoursePendingReports: true,
        showStudentGradeRanking: true,
      });
      const announcements = workbenchSlotById(slots, 'announcements')!;
      const ranking = workbenchSlotById(slots, 'student_grade_ranking')!;
      expect(ranking.placement).toMatchObject({ colStart: 1, rowStart: 3 });
      expect(ranking.placement.colSpan).toBe(announcements.placement.colSpan);
      expect(ranking.placement.rowStart).toBe(
        (announcements.placement.rowStart ?? 0) + 1
      );
      const rowsOf = (slot: WorkbenchBoxSlot) => {
        const start = slot.placement.rowStart ?? 1;
        return [start, start + (slot.placement.rowSpan ?? 1)];
      };
      const [rStart, rEnd] = rowsOf(ranking);
      for (const other of slots) {
        if (other === ranking) continue;
        const [oStart, oEnd] = rowsOf(other);
        const [c0, c1] = span(ranking);
        const [o0, o1] = span(other);
        const overlaps = rStart < oEnd && oStart < rEnd && c0 < o1 && o0 < c1;
        expect(overlaps, `${other.id} overlaps ranking (ad=${showAd})`).toBe(
          false
        );
      }
    }
  });

  it('puts the pending reports and the course averages in one independent cell beside the announcements', () => {
    for (const showAd of [true, false]) {
      const slots = workbenchLayoutForRole('supervisor_professor', {
        showAd,
        showCourseAverages: true,
        showCourseCapacities: true,
        showCoursePendingReports: true,
        showStudentGradeRanking: true,
      });
      const announcements = workbenchSlotById(slots, 'announcements')!;
      const averages = workbenchSlotById(slots, 'course_averages')!;
      // «در حال بررسی» گرید‌اریای جدا ندارد؛ داخل سلول نمودار، درست بالای آن می‌نشیند
      // (پس فاصلهٔ بینشان به ردیف‌های ستون چپ وابسته نیست).
      expect(
        workbenchSlotById(slots, 'course_pending_reports')
      ).toBeUndefined();
      expect(averages.includes).toEqual(['course_pending_reports']);
      expect(averages.placement).toMatchObject({
        colSpan: 6,
        colStart: 7,
        rowStart: announcements.placement.rowStart,
        rowSpan: 3,
        stretch: true,
      });
    }
  });

  it('keeps the pending reports as their own full-width row when there is no course averages box', () => {
    const slots = workbenchLayoutForRole('supervisor_professor', {
      showAd: false,
      showCoursePendingReports: true,
    });
    expect(
      workbenchSlotById(slots, 'course_pending_reports')?.placement
    ).toMatchObject({ colSpan: 12, colStart: 1 });
    expect(workbenchSlotById(slots, 'course_averages')).toBeUndefined();
  });

  it('replaces the learner count cards with the term/module box in the same spot', () => {
    for (const showAd of [true, false]) {
      const base = {
        showAd,
        showCourseAverages: true,
        showStudentGradeRanking: true,
      };
      const before = workbenchLayoutForRole('supervisor_professor', base);
      const after = workbenchLayoutForRole('supervisor_professor', {
        ...base,
        showCourseCapacities: true,
      });
      expect(workbenchSlotById(after, 'learner_counts')).toBeUndefined();
      expect(workbenchSlotById(after, 'course_capacities')?.placement).toEqual(
        workbenchSlotById(before, 'learner_counts')?.placement
      );
    }
  });

  it('gives every evaluation role the learner counts box and none of the old monitor/weak-learners boxes', () => {
    for (const role of [
      'supervisor_professor',
      'mentor_teacher',
      'school_principal',
    ] as const) {
      const ids = workbenchLayoutForRole(role, {
        showAd: false,
        showTeacherCount: true,
      }).map((slot) => slot.id as string);
      expect(ids).toContain('learner_counts');
      expect(ids).not.toContain('monitor');
      expect(ids).not.toContain('weak_learners');
    }
  });

  it('adds the teacher count box under the announcements only when asked for (school principal)', () => {
    const principal = workbenchLayoutForRole('school_principal', {
      showAd: false,
      showTeacherCount: true,
    });
    expect(
      workbenchSlotById(principal, 'teacher_count')?.placement
    ).toMatchObject({
      colSpan: 6,
      colStart: 1,
      rowStart: 3,
    });

    for (const role of ['supervisor_professor', 'mentor_teacher'] as const) {
      const slots = workbenchLayoutForRole(role, { showAd: false });
      expect(workbenchSlotById(slots, 'teacher_count')).toBeUndefined();
    }
  });

  it('adds the course averages box beside the announcements only when asked for', () => {
    for (const role of [
      'supervisor_professor',
      'mentor_teacher',
      'school_principal',
    ] as const) {
      const slots = workbenchLayoutForRole(role, {
        showAd: false,
        showCourseAverages: true,
      });
      const announcements = workbenchSlotById(slots, 'announcements')!;
      const averages = workbenchSlotById(slots, 'course_averages')!;
      expect(averages.placement).toMatchObject({
        colSpan: 6,
        colStart: 7,
        rowStart: 2,
        rowSpan: 2,
      });
      expect(averages.placement.rowStart).toBe(announcements.placement.rowStart);
      expect(span(announcements)[1]).toBe(span(averages)[0]);
      expect(span(averages)[1]).toBe(13);

      const plain = workbenchLayoutForRole(role, { showAd: false });
      expect(workbenchSlotById(plain, 'course_averages')).toBeUndefined();
    }
  });
});

describe('student grade ranking for every evaluation role', () => {
  it('never overlaps another box (with and without ad)', () => {
    for (const role of [
      'supervisor_professor',
      'mentor_teacher',
      'school_principal',
    ] as const) {
      for (const showAd of [true, false]) {
        const slots = workbenchLayoutForRole(role, {
          showAd,
          showCourseAverages: true,
          showCoursePendingReports: true,
          showStudentGradesCard: true,
          showStudentGradeRanking: true,
        });
        expect(workbenchSlotById(slots, 'student_grade_ranking')).toBeDefined();
        const rows = (slot: WorkbenchBoxSlot) => {
          const start = slot.placement.rowStart ?? 1;
          return [start, start + (slot.placement.rowSpan ?? 1)];
        };
        for (const a of slots) {
          for (const b of slots) {
            if (a === b) continue;
            const [aS, aE] = rows(a);
            const [bS, bE] = rows(b);
            const [a0, a1] = span(a);
            const [b0, b1] = span(b);
            const overlap = aS < bE && bS < aE && a0 < b1 && b0 < a1;
            expect(
              overlap,
              `${a.id} overlaps ${b.id} (${role}, ad=${showAd})`
            ).toBe(false);
          }
        }
      }
    }
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

  it('adds self-stretch only when asked', () => {
    expect(workbenchCellClass({ colSpan: 6, stretch: true })).toContain(
      'md:self-stretch'
    );
    expect(workbenchCellClass({ colSpan: 6 })).not.toContain('self-stretch');
  });
});

describe('learner grades row', () => {
  it('spans every grid column so the ad track never leaves a gap below it', () => {
    expect(WORKBENCH_FULL_BLEED_ROW_CLASS).toContain('md:col-start-1');
    expect(WORKBENCH_FULL_BLEED_ROW_CLASS).toContain('md:col-span-full');
    // نباید به ۱۲ ستون محدود باشد (ترک ۱۳ام = تبلیغ).
    expect(WORKBENCH_FULL_BLEED_ROW_CLASS).not.toContain('md:col-span-12');
  });

  it('only the rows beside the ad are narrowed: ad rowSpan stays on rows 1-2', () => {
    const slots = workbenchLayoutForRole('student', { showAd: true });
    const ad = workbenchSlotById(slots, 'ad')!.placement;
    expect(ad).toMatchObject({ colStart: 13, rowStart: 1, rowSpan: 2 });
    // ردیف نمرات (ردیف ۳ به بعد) از ترک تبلیغ آزاد است.
    expect((ad.rowStart ?? 0) + (ad.rowSpan ?? 1)).toBe(3);
  });

  it('gives the weeks box a wider column than the weekly-trend box', () => {
    const match = WORKBENCH_LEARNER_GRADES_INNER_CLASS.match(
      /lg:grid-cols-\[minmax\(0,([\d.]+)fr\)_minmax\(0,([\d.]+)fr\)\]/
    );
    expect(match).not.toBeNull();
    const [weeksFr, trendFr] = [Number(match![1]), Number(match![2])];
    expect(weeksFr).toBeGreaterThan(trendFr);
  });
});
