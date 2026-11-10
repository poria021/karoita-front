import type { CSSProperties } from 'react';

import type { UserRole } from '@/types/auth';

/**
 * گرید میز کار — شِل ۱۲ستونه (+ ترک اختیاری تبلیغ ۲۴۰px).
 * محل/اندازه با `colSpan` / `rowSpan` / `colStart` / `rowStart`.
 * شکل لی‌اوت هر نقش همان قبلی است؛ فقط روی نقشهٔ گرید نشسته.
 */

/* -------------------------------------------------------------------------- */
/* اندازهٔ ثابت                                                                */
/* -------------------------------------------------------------------------- */

export const WORKBENCH_AD_WIDTH_PX = 240;
export const WORKBENCH_AD_HEIGHT_PX = 320;
export const WORKBENCH_AD_ASPECT_CLASS = 'aspect-[3/4]';

export const WORKBENCH_SIDE_PANEL_HEIGHT_PX = 200;
export const WORKBENCH_SIDE_PANEL_STYLE: CSSProperties = {
  height: WORKBENCH_SIDE_PANEL_HEIGHT_PX,
  minHeight: WORKBENCH_SIDE_PANEL_HEIGHT_PX,
  maxHeight: WORKBENCH_SIDE_PANEL_HEIGHT_PX,
};

export const WORKBENCH_MONITOR_PANEL_HEIGHT_PX = 188;
export const WORKBENCH_MONITOR_PANEL_STYLE: CSSProperties = {
  height: WORKBENCH_MONITOR_PANEL_HEIGHT_PX,
  minHeight: WORKBENCH_MONITOR_PANEL_HEIGHT_PX,
  maxHeight: WORKBENCH_MONITOR_PANEL_HEIGHT_PX,
};

export const WORKBENCH_LEARNER_STACK_GAP_PX = 16;
export const WORKBENCH_LEARNER_WELCOME_HEIGHT_PX = 112;
export const WORKBENCH_LEARNER_WELCOME_STYLE: CSSProperties = {
  height: WORKBENCH_LEARNER_WELCOME_HEIGHT_PX,
  minHeight: WORKBENCH_LEARNER_WELCOME_HEIGHT_PX,
  maxHeight: WORKBENCH_LEARNER_WELCOME_HEIGHT_PX,
};

export const WORKBENCH_LEARNER_ANNOUNCEMENTS_HEIGHT_PX =
  WORKBENCH_AD_HEIGHT_PX -
  WORKBENCH_LEARNER_WELCOME_HEIGHT_PX -
  WORKBENCH_LEARNER_STACK_GAP_PX;

export const WORKBENCH_LEARNER_ANNOUNCEMENTS_STYLE: CSSProperties = {
  height: WORKBENCH_LEARNER_ANNOUNCEMENTS_HEIGHT_PX,
  minHeight: WORKBENCH_LEARNER_ANNOUNCEMENTS_HEIGHT_PX,
  maxHeight: WORKBENCH_LEARNER_ANNOUNCEMENTS_HEIGHT_PX,
};

/** ارشد: پرونده‌ها عرض محتوا | ساختار+نقش‌ها — گرید داخلی باند تمام‌عرض. */
export const WORKBENCH_SENIOR_BAND_CLASS =
  'grid min-h-0 min-w-0 w-full grid-cols-1 gap-kv-group md:grid-cols-[max-content_auto] md:items-start';

export const WORKBENCH_SENIOR_ONBOARDING_CLASS =
  'h-auto w-full max-w-full md:w-fit';

export const WORKBENCH_SENIOR_ORG_STRUCTURE_CLASS =
  'h-auto min-h-[14rem] w-full max-w-full md:h-[14rem] md:w-[24rem] md:min-w-[24rem] md:max-w-[24rem]';

export const WORKBENCH_SENIOR_ORG_STRUCTURE_STACK_CLASS =
  'flex min-w-0 w-full flex-col gap-kv-group md:w-fit md:justify-self-end';

export const WORKBENCH_SENIOR_ROLE_COUNTS_CLASS =
  'h-auto min-h-[16rem] w-full max-w-full md:h-[18.9rem] md:min-h-[18.9rem] md:w-[24rem]';

/** ردیف نمرات فراگیر داخل سلول تمام‌عرض. */
export const WORKBENCH_LEARNER_GRADES_INNER_CLASS =
  'grid grid-cols-1 gap-kv-group lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:items-stretch';

export const WORKBENCH_FULL_SPAN = 'min-w-0 w-full md:col-span-12';

export const WORKBENCH_SHORTCUTS_GRID_CLASS =
  'grid list-none gap-kv-group sm:grid-cols-2 lg:grid-cols-3';

/* -------------------------------------------------------------------------- */
/* نقشهٔ col / row-span                                                         */
/* -------------------------------------------------------------------------- */

export type WorkbenchBoxId =
  | 'welcome'
  | 'announcements'
  | 'ad'
  | 'materials'
  | 'senior_band'
  | 'monitor'
  | 'capacity'
  | 'checklist'
  | 'learner_grades';

export type WorkbenchHeightToken =
  | 'welcome'
  | 'side'
  | 'learnerAnnounce'
  | 'monitor'
  | 'auto';

export type WorkbenchColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type WorkbenchBoxPlacement = {
  colSpan: WorkbenchColSpan;
  rowSpan?: number;
  colStart?: number;
  rowStart?: number;
  height?: WorkbenchHeightToken;
};

export type WorkbenchLayoutKind =
  | 'classic'
  | 'learner'
  | 'senior'
  | 'evaluation';

export type WorkbenchBoxSlot = {
  id: WorkbenchBoxId;
  placement: WorkbenchBoxPlacement;
};

export type WorkbenchLayoutOptions = {
  showAd: boolean;
  showCapacity?: boolean;
};

const HEIGHT_STYLE: Record<
  Exclude<WorkbenchHeightToken, 'auto'>,
  CSSProperties
> = {
  welcome: WORKBENCH_LEARNER_WELCOME_STYLE,
  side: WORKBENCH_SIDE_PANEL_STYLE,
  learnerAnnounce: WORKBENCH_LEARNER_ANNOUNCEMENTS_STYLE,
  monitor: WORKBENCH_MONITOR_PANEL_STYLE,
};

const COL_SPAN_CLASS: Record<WorkbenchColSpan, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
};

const COL_START_CLASS: Record<number, string> = {
  1: 'md:col-start-1',
  2: 'md:col-start-2',
  3: 'md:col-start-3',
  4: 'md:col-start-4',
  5: 'md:col-start-5',
  6: 'md:col-start-6',
  7: 'md:col-start-7',
  8: 'md:col-start-8',
  9: 'md:col-start-9',
  10: 'md:col-start-10',
  11: 'md:col-start-11',
  12: 'md:col-start-12',
  13: 'md:col-start-13',
};

const ROW_SPAN_CLASS: Record<number, string> = {
  1: 'md:row-span-1',
  2: 'md:row-span-2',
  3: 'md:row-span-3',
};

const ROW_START_CLASS: Record<number, string> = {
  1: 'md:row-start-1',
  2: 'md:row-start-2',
  3: 'md:row-start-3',
  4: 'md:row-start-4',
};

const CELL_BASE = 'min-h-0 min-w-0 w-full';

export function workbenchCellClass(placement: WorkbenchBoxPlacement): string {
  const parts = [CELL_BASE, COL_SPAN_CLASS[placement.colSpan]];
  if (placement.colStart != null) {
    parts.push(COL_START_CLASS[placement.colStart] ?? '');
  }
  if (placement.rowStart != null) {
    parts.push(ROW_START_CLASS[placement.rowStart] ?? '');
  }
  if (placement.rowSpan != null && placement.rowSpan > 1) {
    parts.push(ROW_SPAN_CLASS[placement.rowSpan] ?? '');
  }
  return parts.filter(Boolean).join(' ');
}

export function workbenchAdCellClass(placement: WorkbenchBoxPlacement): string {
  return [
    workbenchCellClass(placement),
    'max-w-[240px] justify-self-center md:w-[240px] md:max-w-none md:justify-self-end',
  ].join(' ');
}

export function workbenchCellStyle(
  placement: WorkbenchBoxPlacement
): CSSProperties | undefined {
  if (!placement.height || placement.height === 'auto') return undefined;
  return HEIGHT_STYLE[placement.height];
}

/** شِل صفحه — ۱۲ ستون؛ با تبلیغ ترک ۱۳ام. */
export function workbenchShellClass(showAd: boolean): string {
  return [
    'grid w-full grid-cols-1 gap-kv-group md:items-start',
    showAd
      ? 'md:grid-cols-[repeat(12,minmax(0,1fr))_240px]'
      : 'md:grid-cols-12',
  ].join(' ');
}

/** @deprecated — از `workbenchShellClass` استفاده کنید. */
export const WORKBENCH_GRID_CLASS = workbenchShellClass(false);

export function workbenchLayoutKindFor(role: UserRole): WorkbenchLayoutKind {
  if (
    role === 'supervisor_professor' ||
    role === 'mentor_teacher' ||
    role === 'school_principal'
  ) {
    return 'evaluation';
  }
  if (role === 'super_admin' || role === 'assistant_admin') return 'senior';
  if (role === 'student' || role === 'skill_learner') return 'learner';
  return 'classic';
}

/** لی‌اوت ارشد تبلیغ ندارد؛ مدیر ارشد اصلاً spot ندارد. */
export function workbenchAllowsAdSpot(role: UserRole): boolean {
  return workbenchLayoutKindFor(role) !== 'senior';
}

function classicSlots(showAd: boolean): WorkbenchBoxSlot[] {
  const slots: WorkbenchBoxSlot[] = [
    {
      id: 'welcome',
      placement: { colSpan: 5, colStart: 1, rowStart: 1, height: 'side' },
    },
    {
      id: 'announcements',
      placement: { colSpan: 7, colStart: 6, rowStart: 1, height: 'side' },
    },
  ];
  if (showAd) {
    slots.push({
      id: 'ad',
      placement: { colSpan: 1, colStart: 13, rowStart: 1, rowSpan: 1 },
    });
  }
  return slots;
}

/** همان نسبت ۱.۵ | ۱ اطلاعیه/جزوه روی ۱۲ ستون → ۷ | ۵ */
function learnerSlots(showAd: boolean): WorkbenchBoxSlot[] {
  const slots: WorkbenchBoxSlot[] = [
    {
      id: 'welcome',
      placement: { colSpan: 12, colStart: 1, rowStart: 1, height: 'welcome' },
    },
    {
      id: 'announcements',
      placement: {
        colSpan: 7,
        colStart: 1,
        rowStart: 2,
        height: 'learnerAnnounce',
      },
    },
    {
      id: 'materials',
      placement: {
        colSpan: 5,
        colStart: 8,
        rowStart: 2,
        height: 'learnerAnnounce',
      },
    },
  ];
  if (showAd) {
    slots.push({
      id: 'ad',
      placement: { colSpan: 1, colStart: 13, rowStart: 1, rowSpan: 2 },
    });
  }
  return slots;
}

/** خوش‌آمد + باند داخلی پرونده|ساختار (عرض محتوا مثل قبل). */
function seniorSlots(): WorkbenchBoxSlot[] {
  return [
    {
      id: 'welcome',
      placement: { colSpan: 12, colStart: 1, rowStart: 1, height: 'welcome' },
    },
    {
      id: 'senior_band',
      placement: { colSpan: 12, colStart: 1, rowStart: 2, height: 'auto' },
    },
  ];
}

/** همان ۵۰/۵۰ اطلاعیه|مانیتورینگ؛ ظرفیت زیر اطلاعیه؛ تبلیغ row-span ۲. */
function evaluationSlots(
  showAd: boolean,
  showCapacity: boolean
): WorkbenchBoxSlot[] {
  const slots: WorkbenchBoxSlot[] = [
    {
      id: 'welcome',
      placement: { colSpan: 12, colStart: 1, rowStart: 1, height: 'welcome' },
    },
    {
      id: 'announcements',
      placement: {
        colSpan: 6,
        colStart: 1,
        rowStart: 2,
        height: 'learnerAnnounce',
      },
    },
    {
      id: 'monitor',
      placement: {
        colSpan: 6,
        colStart: 7,
        rowStart: 2,
        height: 'learnerAnnounce',
      },
    },
  ];
  if (showCapacity) {
    slots.push({
      id: 'capacity',
      placement: {
        colSpan: 6,
        colStart: 1,
        rowStart: 3,
        height: 'monitor',
      },
    });
  }
  if (showAd) {
    slots.push({
      id: 'ad',
      placement: { colSpan: 1, colStart: 13, rowStart: 1, rowSpan: 2 },
    });
  }
  return slots;
}

export function workbenchLayoutForRole(
  role: UserRole,
  options: WorkbenchLayoutOptions
): WorkbenchBoxSlot[] {
  const kind = workbenchLayoutKindFor(role);
  const showAd = options.showAd && workbenchAllowsAdSpot(role);

  switch (kind) {
    case 'learner':
      return learnerSlots(showAd);
    case 'senior':
      return seniorSlots();
    case 'evaluation':
      return evaluationSlots(showAd, options.showCapacity === true);
    default:
      return classicSlots(showAd);
  }
}

export function workbenchSlotById(
  slots: readonly WorkbenchBoxSlot[],
  id: WorkbenchBoxId
): WorkbenchBoxSlot | undefined {
  return slots.find((slot) => slot.id === id);
}

/** placement تمام‌عرض برای چک‌لیست / نمرات زیر ردیف بالا. */
export const WORKBENCH_FULL_ROW_PLACEMENT: WorkbenchBoxPlacement = {
  colSpan: 12,
  colStart: 1,
  height: 'auto',
};
