import { describe, expect, it } from 'vitest';

import {
  workbenchLayoutForRole,
  workbenchSlotById,
  type WorkbenchBoxSlot,
} from './workbench-grid';

const rowsOf = (slot: WorkbenchBoxSlot) => {
  const start = slot.placement.rowStart ?? 1;
  return [start, start + (slot.placement.rowSpan ?? 1)] as const;
};
const colsOf = (slot: WorkbenchBoxSlot) => {
  const start = slot.placement.colStart ?? 1;
  return [start, start + slot.placement.colSpan] as const;
};

describe('course pending reports slot (supervisor professor)', () => {
  it('با میانگین نمره داخل سلول نمودار می‌آید (اسلات جدا ندارد)', () => {
    for (const showAd of [true, false]) {
      const slots = workbenchLayoutForRole('supervisor_professor', {
        showAd,
        showCourseAverages: true,
        showCourseCapacities: true,
        showCoursePendingReports: true,
      });
      expect(
        workbenchSlotById(slots, 'course_pending_reports')
      ).toBeUndefined();
      expect(
        workbenchSlotById(slots, 'course_averages')?.includes
      ).toEqual(['course_pending_reports']);
    }
  });

  it('بدون میانگین نمره تمام‌عرض زیر ظرفیت می‌نشیند و روی چیزی نمی‌افتد', () => {
    for (const showAd of [true, false]) {
      const slots = workbenchLayoutForRole('supervisor_professor', {
        showAd,
        showCourseAverages: false,
        showCourseCapacities: true,
        showCoursePendingReports: true,
      });
      const capacities = workbenchSlotById(slots, 'course_capacities')!;
      const box = workbenchSlotById(slots, 'course_pending_reports')!;
      expect(box.placement).toMatchObject({ colSpan: 12, colStart: 1 });
      expect(box.placement.rowStart).toBe(rowsOf(capacities)[1]);

      const [r0, r1] = rowsOf(box);
      const [c0, c1] = colsOf(box);
      for (const other of slots) {
        if (other === box) continue;
        const [o0, o1] = rowsOf(other);
        const [p0, p1] = colsOf(other);
        const overlap = r0 < o1 && o0 < r1 && c0 < p1 && p0 < c1;
        expect(overlap, `${other.id} overlaps (ad=${showAd})`).toBe(false);
      }
    }
  });

  it('فقط وقتی خواسته شود می‌آید', () => {
    const plain = workbenchLayoutForRole('supervisor_professor', {
      showAd: false,
    });
    expect(workbenchSlotById(plain, 'course_pending_reports')).toBeUndefined();
    for (const role of ['mentor_teacher', 'school_principal'] as const) {
      const slots = workbenchLayoutForRole(role, { showAd: false });
      expect(workbenchSlotById(slots, 'course_pending_reports')).toBeUndefined();
    }
  });
});

describe('course pending reports slot (mentor teacher / school principal)', () => {
  const roles = ['mentor_teacher', 'school_principal'] as const;

  const layout = (
    role: (typeof roles)[number],
    showAd: boolean,
    beside = true
  ) =>
    workbenchLayoutForRole(role, {
      showAd,
      showTeacherCount: role === 'school_principal',
      showPendingBesideAnnouncements: beside,
    });

  it('کنار اطلاعیه‌ها (نیمهٔ چپ همان ردیف) می‌نشیند', () => {
    for (const role of roles) {
      for (const showAd of [true, false]) {
        const slots = layout(role, showAd);
        const announcements = workbenchSlotById(slots, 'announcements')!;
        const box = workbenchSlotById(slots, 'course_pending_reports')!;
        expect(announcements.placement).toMatchObject({
          colSpan: 6,
          colStart: 1,
          rowStart: 2,
        });
        expect(box.placement).toMatchObject({
          colSpan: 6,
          colStart: 7,
          rowStart: 2,
          height: announcements.placement.height,
        });
      }
    }
  });

  it('روی هیچ باکسی نمی‌افتد', () => {
    for (const role of roles) {
      for (const showAd of [true, false]) {
        const slots = layout(role, showAd);
        for (const a of slots) {
          for (const b of slots) {
            if (a === b) continue;
            const [r0, r1] = rowsOf(a);
            const [o0, o1] = rowsOf(b);
            const [c0, c1] = colsOf(a);
            const [p0, p1] = colsOf(b);
            const overlap = r0 < o1 && o0 < r1 && c0 < p1 && p0 < c1;
            expect(
              overlap,
              `${a.id} overlaps ${b.id} (${role}, ad=${showAd})`
            ).toBe(false);
          }
        }
      }
    }
  });

  it('بدون گزینه، چیدمان قبلی (اطلاعیه‌ها تمام‌عرض با تبلیغ) می‌ماند', () => {
    for (const role of roles) {
      const slots = layout(role, true, false);
      expect(workbenchSlotById(slots, 'course_pending_reports')).toBeUndefined();
      expect(
        workbenchSlotById(slots, 'announcements')!.placement.colSpan
      ).toBe(12);
    }
  });
});

describe('student grades card slot (mentor teacher / school principal)', () => {
  const roles = ['mentor_teacher', 'school_principal'] as const;

  const layout = (
    role: (typeof roles)[number],
    showAd: boolean,
    showStudentGradesCard = true
  ) =>
    workbenchLayoutForRole(role, {
      showAd,
      showTeacherCount: role === 'school_principal',
      showPendingBesideAnnouncements: true,
      showStudentGradesCard,
    });

  it('یک ردیف زیر «تعداد فراگیران» (همان ستون و همان عرض) می‌نشیند', () => {
    for (const role of roles) {
      for (const showAd of [true, false]) {
        const slots = layout(role, showAd);
        const counts = workbenchSlotById(slots, 'learner_counts')!;
        const card = workbenchSlotById(slots, 'student_grades_card')!;
        expect(card, `${role} ad=${showAd}`).toBeDefined();
        expect(card.placement.colSpan).toBe(counts.placement.colSpan);
        expect(card.placement.colStart).toBe(counts.placement.colStart);
        expect(card.placement.rowStart).toBe(rowsOf(counts)[1]);
      }
    }
  });

  it('روی هیچ باکسی نمی‌افتد', () => {
    for (const role of roles) {
      for (const showAd of [true, false]) {
        const slots = layout(role, showAd);
        for (const a of slots) {
          for (const b of slots) {
            if (a === b) continue;
            const [r0, r1] = rowsOf(a);
            const [o0, o1] = rowsOf(b);
            const [c0, c1] = colsOf(a);
            const [p0, p1] = colsOf(b);
            const overlap = r0 < o1 && o0 < r1 && c0 < p1 && p0 < c1;
            expect(
              overlap,
              `${a.id} overlaps ${b.id} (${role}, ad=${showAd})`
            ).toBe(false);
          }
        }
      }
    }
  });

  it('فقط وقتی خواسته شود می‌آید', () => {
    for (const role of roles) {
      const slots = layout(role, true, false);
      expect(workbenchSlotById(slots, 'student_grades_card')).toBeUndefined();
    }
  });
});
