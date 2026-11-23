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

export const WORKBENCH_MID_PANEL_HEIGHT_PX = 304;
export const WORKBENCH_MID_PANEL_STYLE: CSSProperties = {
  height: WORKBENCH_MID_PANEL_HEIGHT_PX,
  minHeight: WORKBENCH_MID_PANEL_HEIGHT_PX,
  maxHeight: WORKBENCH_MID_PANEL_HEIGHT_PX,
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
/**
 * ارتفاع سلول خوش‌آمد فقط از md — روی موبایل چیپ نیم‌سال زیر پنل می‌آید
 * و سلول باید بتواند قد بکشد (پنل خودش ۱۱۲px ثابت می‌ماند).
 */
export const WORKBENCH_LEARNER_WELCOME_CELL_CLASS =
  'md:h-[7rem] md:min-h-[7rem] md:max-h-[7rem]';

export const WORKBENCH_LEARNER_ANNOUNCEMENTS_HEIGHT_PX =
  WORKBENCH_AD_HEIGHT_PX -
  WORKBENCH_LEARNER_WELCOME_HEIGHT_PX -
  WORKBENCH_LEARNER_STACK_GAP_PX;

export const WORKBENCH_LEARNER_ANNOUNCEMENTS_STYLE: CSSProperties = {
  height: WORKBENCH_LEARNER_ANNOUNCEMENTS_HEIGHT_PX,
  minHeight: WORKBENCH_LEARNER_ANNOUNCEMENTS_HEIGHT_PX,
  maxHeight: WORKBENCH_LEARNER_ANNOUNCEMENTS_HEIGHT_PX,
};

/**
 * ارتفاع یکسان ردیف ۳ ارشد: تعداد نقش‌ها | دسترسی گزارش‌ها | اطلاعیه‌های منتشرشده.
 * `h-[24rem]` ثابت تا stretch/`h-0` محتوا را نبلعد.
 */
export const WORKBENCH_SENIOR_ROLE_STATS_CLASS = 'h-[24rem]';

/**
 * باکس‌های «ضعیف‌ترین و قوی‌ترین»: ارتفاع در حالت خالی، بارگذاری، خطا و دارای داده یکی است.
 * محتوای داخلی (WORKBENCH_RANKING_BODY_CLASS) ارتفاع باکس را تغییر نمی‌دهد؛ اگر از فضا بیشتر شد اسکرول می‌شود.
 * ارتفاع پایه ۲۴rem است و وقتی سلول گرید `stretch` باشد، باکس هم‌قد ردیف می‌شود.
 */
export const WORKBENCH_RANKING_BOX_CLASS = 'h-full';
/** min-height به‌صورت style می‌آید؛ چون `min-h-0` کلاس سلول گرید کلاس `min-h-*` را override می‌کند. */
export const WORKBENCH_RANKING_BOX_STYLE: CSSProperties = { minHeight: '24rem' };
/**
 * `overflow-y: auto` به‌تنهایی `overflow-x` را هم auto می‌کند و هر سرریزِ چند پیکسلی
 * (مثل ردیف‌های با margin منفی) اسکرول افقی می‌سازد؛ این باکس‌ها فقط عمودی اسکرول می‌شوند.
 */
export const WORKBENCH_RANKING_BODY_CLASS =
  'flex min-h-0 grow basis-0 flex-col overflow-x-hidden overflow-y-auto';

/**
 * ردیف نمرات فراگیر داخل سلول تمام‌عرض.
 * ترتیب DOM: «وضعیت هفته‌ها» (اول) | «روند نمره هفتگی» — وضعیت هفته‌ها پهن‌تر است
 * (۵ : ۴) چون خانه‌های هفته‌های کارورزی (تا ۱۶ تا) به عرض بیشتری نیاز دارند.
 */
export const WORKBENCH_LEARNER_GRADES_INNER_CLASS =
  'grid grid-cols-1 gap-kv-group lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:items-stretch';

/**
 * سلولی که از اولین تا آخرین ستون گرید را می‌گیرد (`grid-column: 1 / -1`).
 * برخلاف `WORKBENCH_FULL_SPAN` (فقط ۱۲ ستون)، ترک ۲۴۰px تبلیغ را هم شامل می‌شود؛
 * پس وقتی تبلیغ هست فقط ردیف‌های بالاییِ کنار تبلیغ باریک می‌شوند و این ردیف
 * همیشه کل عرض را پر می‌کند.
 */
export const WORKBENCH_FULL_BLEED_ROW_CLASS =
  'min-h-0 min-w-0 w-full md:col-start-1 md:col-span-full';

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
  | 'senior_queue'
  | 'senior_donut'
  | 'senior_weak_ranking'
  | 'senior_org_counts'
  | 'senior_role_counts'
  | 'senior_report_access'
  | 'senior_published'
  | 'regional_counts'
  | 'regional_gender'
  | 'regional_teacher_ranking'
  | 'regional_school_ranking'
  | 'learner_counts'
  | 'teacher_count'
  | 'course_averages'
  | 'course_capacities'
  | 'course_pending_reports'
  | 'student_grade_ranking'
  | 'student_grades_card'
  | 'checklist'
  | 'learner_grades';

export type WorkbenchHeightToken =
  'welcome' | 'side' | 'learnerAnnounce' | 'mid' | 'monitor' | 'ad' | 'auto';

export type WorkbenchColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type WorkbenchBoxPlacement = {
  colSpan: WorkbenchColSpan;
  rowSpan?: number;
  colStart?: number;
  rowStart?: number;
  height?: WorkbenchHeightToken;
  /** هم‌قدشدن با بلندترین باکس همان ردیف (`align-self: stretch`). */
  stretch?: boolean;
  /** از اولین تا آخرین ستون (ترک تبلیغ هم) — `colSpan`/`colStart` نادیده گرفته می‌شود. */
  fullBleed?: boolean;
};

export type WorkbenchLayoutKind =
  'classic' | 'learner' | 'senior' | 'evaluation';

export type WorkbenchBoxSlot = {
  id: WorkbenchBoxId;
  placement: WorkbenchBoxPlacement;
  /**
   * باکس‌هایی که داخل همین سلول (زیر هم) رندر می‌شوند؛ خودشان گرید‌اریای جدا
   * ندارند و ردیف‌های ستون کناری روی فاصله‌شان اثر نمی‌گذارد.
   */
  includes?: readonly WorkbenchBoxId[];
};

export type WorkbenchLayoutOptions = {
  showAd: boolean;
  /** باکس «معلمان» — فقط مدیر مدرسه. */
  showTeacherCount?: boolean;
  /** باکس «میانگین نمرهٔ دروس» — فقط استاد راهنما. */
  showCourseAverages?: boolean;
  /** باکس «تعداد دانشجو/مهارت‌آموز به‌تفکیک ترمی/پودمانی» — فقط استاد راهنما. */
  showCourseCapacities?: boolean;
  /** استاد راهنما: کارت‌های «گزارش در حال بررسی» هر درس، تمام‌عرض. */
  showCoursePendingReports?: boolean;
  /** استاد راهنما: ۵ ضعیف‌ترین و ۵ قوی‌ترین فراگیر بر اساس نمرهٔ نهایی، تمام‌عرض. */
  showStudentGradeRanking?: boolean;
  /**
   * استاد راهنما / معلم راهنما / مدیر مدرسه: کارت نمرهٔ نهایی همهٔ فراگیران.
   * با تبلیغ زیر خودِ تبلیغ؛ بدون تبلیغ یک ردیف زیر ستون تعداد.
   */
  showStudentGradesCard?: boolean;
  /**
   * معلم راهنما / مدیر مدرسه: کارت‌های «در انتظار بررسی» هر درس، کنار اطلاعیه‌ها
   * (نیمهٔ چپ ردیف ۲، هم‌قدِ اطلاعیه‌ها). اطلاعیه‌ها در این حالت نیم‌عرض می‌مانند.
   */
  showPendingBesideAnnouncements?: boolean;
  /**
   * آموزش و پرورش منطقه / مدیر دانشکده: آمار + تفکیک مدارس + رتبه‌بندی‌ها
   * (هندسهٔ یکسان؛ محتوای ویجت‌ها بر اساس نقش در بورد انتخاب می‌شود).
   */
  showRegionalCounts?: boolean;
};

export const WORKBENCH_AD_ROW_STYLE: CSSProperties = {
  height: WORKBENCH_AD_HEIGHT_PX,
  minHeight: WORKBENCH_AD_HEIGHT_PX,
  maxHeight: WORKBENCH_AD_HEIGHT_PX,
};

const HEIGHT_STYLE: Record<
  Exclude<WorkbenchHeightToken, 'auto' | 'welcome'>,
  CSSProperties
> = {
  side: WORKBENCH_SIDE_PANEL_STYLE,
  learnerAnnounce: WORKBENCH_LEARNER_ANNOUNCEMENTS_STYLE,
  mid: WORKBENCH_MID_PANEL_STYLE,
  monitor: WORKBENCH_MONITOR_PANEL_STYLE,
  ad: WORKBENCH_AD_ROW_STYLE,
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
  5: 'md:row-start-5',
  6: 'md:row-start-6',
  7: 'md:row-start-7',
};

const CELL_BASE = 'min-h-0 min-w-0 w-full';

export function workbenchCellClass(placement: WorkbenchBoxPlacement): string {
  const parts = [
    CELL_BASE,
    placement.fullBleed
      ? 'md:col-start-1 md:col-span-full'
      : COL_SPAN_CLASS[placement.colSpan],
  ];
  if (placement.colStart != null && !placement.fullBleed) {
    parts.push(COL_START_CLASS[placement.colStart] ?? '');
  }
  if (placement.rowStart != null) {
    parts.push(ROW_START_CLASS[placement.rowStart] ?? '');
  }
  if (placement.rowSpan != null && placement.rowSpan > 1) {
    parts.push(ROW_SPAN_CLASS[placement.rowSpan] ?? '');
  }
  if (placement.stretch) {
    parts.push('md:self-stretch');
  }
  if (placement.height === 'welcome') {
    parts.push(WORKBENCH_LEARNER_WELCOME_CELL_CLASS);
  }
  return parts.filter(Boolean).join(' ');
}

/**
 * سلول تبلیغ. نسبت باکس تبلیغ همه‌جا ۳:۴ است (`WORKBENCH_AD_ASPECT_CLASS`).
 * موبایل: تمام‌عرض (همهٔ پنل‌ها یکسان، همان `WorkbenchAdBox`).
 * md به بالا: ستون ثابت ۲۴۰px.
 */
export function workbenchAdCellClass(
  placement: WorkbenchBoxPlacement
): string {
  return [
    workbenchCellClass(placement),
    'justify-self-stretch',
    'md:w-[240px] md:max-w-none md:justify-self-end',
  ].join(' ');
}

export function workbenchCellStyle(
  placement: WorkbenchBoxPlacement
): CSSProperties | undefined {
  if (!placement.height || placement.height === 'auto' || placement.height === 'welcome') {
    // welcome از کلاس md-only استفاده می‌کند تا موبایل قد بکشد.
    return undefined;
  }
  return HEIGHT_STYLE[placement.height];
}

/** شِل صفحه — ۱۲ ستون؛ با تبلیغ ترک ۱۳ام. */
export function workbenchShellClass(
  showAd: boolean,
  /** تبلیغِ چندردیفه: اضافه‌قدِ سلول تبلیغ فقط به ردیف سوم برسد، نه به ردیف خوش‌آمد. */
  flexibleThirdRow = false
): string {
  return [
    'grid w-full grid-cols-1 gap-kv-group md:items-start',
    flexibleThirdRow && showAd ? 'md:grid-rows-[auto_auto_1fr]' : '',
    showAd
      ? 'md:grid-cols-[repeat(12,minmax(0,1fr))_240px]'
      : 'md:grid-cols-12',
  ].join(' ');
}

/** کلاس شل میز کار فراگیر: فقط در موبایل (< md) ارتفاع پنل‌ها را مناسب تک‌ستون می‌کند (`globals.css`). */
export const WORKBENCH_LEARNER_MOBILE_CLASS = 'wb-learner-stack';

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

/**
 * خوش‌آمد تمام‌عرض با ارتفاع ثابت خوش‌آمد (مثل بقیهٔ پنل‌ها؛ مستقل از تبلیغ).
 * تبلیغ در ترک ۲۴۰px کنار ردیف اول؛ اطلاعیه‌ها ردیف دوم، نصف گرید (۶ ستون).
 */
function classicSlots(
  showAd: boolean,
  showRegionalCounts = false,
  /** سازمان مرکزی: خوش‌آمد تمام‌عرض، بدون آمار/نمره زیر تبلیغ؛ تبلیغ از ردیف دوم. */
  central = false
): WorkbenchBoxSlot[] {
  const slots: WorkbenchBoxSlot[] = [
    {
      id: 'welcome',
      placement: {
        colSpan: 12,
        colStart: 1,
        rowStart: 1,
        height: 'welcome',
        ...(central && showAd ? { fullBleed: true } : {}),
      },
    },
    {
      id: 'announcements',
      // منطقه: هم‌قدِ «تفکیک مدارس» (ارتفاع از ردیف می‌آید)؛ بقیهٔ نقش‌ها ارتفاع ثابت.
      placement: showRegionalCounts
        ? { colSpan: 6, colStart: 1, rowStart: 2, height: 'mid' }
        : {
            colSpan: 6,
            colStart: 1,
            rowStart: 2,
            height: 'learnerAnnounce',
          },
    },
  ];
  if (showRegionalCounts) {
    // آموزش و پرورش منطقه: «تفکیک مدارس» (دخترانه/پسرانه) نیمهٔ دیگر ردیف دوم، کنار اطلاعیه‌ها.
    slots.push({
      id: 'regional_gender',
      placement: { colSpan: 6, colStart: 7, rowStart: 2, height: 'mid' },
    });
    // «آمار منطقه»: بدون تبلیغ، ردیف چهارم و تمام‌عرض.
    // با تبلیغ داخل سلول `ad` زیر خود تبلیغ می‌آید (`includes`).
    if (!showAd && !central) {
      slots.push({
        id: 'regional_counts',
        placement: { colSpan: 12, colStart: 1, rowStart: 4 },
      });
    }
    // ضعیف‌ترین/قوی‌ترین معلمان منطقه: نیمهٔ دیگر ردیف سوم، کنار «مدارس/استان‌ها ضعیف/قوی».
    slots.push({
      id: 'regional_teacher_ranking',
      placement: { colSpan: 6, colStart: 7, rowStart: 3, stretch: true },
    });
    // منطقه: مدارس؛ سازمان مرکزی: استان‌ها (نمودار میله‌ای) — ردیف سوم، نیمهٔ راست.
    slots.push({
      id: 'regional_school_ranking',
      placement: { colSpan: 6, colStart: 1, rowStart: 3, stretch: true },
    });
  }
  if (showAd && central) {
    // سازمان مرکزی: تبلیغ زیر خوش‌آمد (ردیف‌های ۲–۳)، بدون نمره/آمار.
    slots.push({
      id: 'ad',
      placement: { colSpan: 1, colStart: 13, rowStart: 2, rowSpan: 2 },
    });
    return slots;
  }
  if (showAd) {
    slots.push({
      id: 'ad',
      placement: {
        colSpan: 1,
        colStart: 13,
        rowStart: 1,
        // منطقه/دانشکده: نمره+آمار چسبیده زیر تبلیغ در همین سلول (ردیف‌های ۱–۳).
        // شِل `flexibleThirdRow` + overflow روی سلول، ارتفاع را از باکس‌های چپ
        // می‌گیرد تا ردیف خوش‌آمد کش نیاید و بین تبلیغ و نمره شکاف نماند.
        rowSpan: showRegionalCounts ? 3 : 2,
      },
      ...(showRegionalCounts
        ? {
            includes: ['student_grades_card', 'regional_counts'] as const,
          }
        : {}),
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

/**
 * ارشد (bento ۱۲ستونه، چهار ردیف — RTL: ستون ۱ سمت راست، ستون ۱۲ سمت چپ):
 *   ردیف ۱) خوش‌آمد تمام‌عرض
 *   ردیف ۲-۳) صف بررسی (۴) | وضعیت پرونده‌ها (۵) | ستون چپ (۳): ساختار
 *      سازمانی روی ردیف ۲ و درست زیرش، هم‌عرض، تعداد نقش‌ها روی ردیف ۳؛
 *      صف بررسی فقط ردیف ۲ را می‌گیرد و هم‌قدِ دونات است.
 *   ردیف ۳) آخرین اطلاعیه‌های منتشرشده (۴، زیر صف بررسی) | دسترسی گزارش‌ها | تعداد نقش‌ها
 * همهٔ سلول‌ها `stretch` هستند تا هر ردیف هم‌قد شود.
 * ترتیب آرایه همان ترتیب DOM (موبایل) است و روی جای دسکتاپ اثر ندارد.
 */
function seniorSlots(): WorkbenchBoxSlot[] {
  const slots: WorkbenchBoxSlot[] = [
    {
      id: 'welcome',
      placement: { colSpan: 12, colStart: 1, rowStart: 1, height: 'welcome' },
    },
    {
      id: 'senior_queue',
      placement: { colSpan: 4, colStart: 1, rowStart: 2, stretch: true },
    },
    {
      id: 'senior_donut',
      placement: { colSpan: 5, colStart: 5, rowStart: 2, stretch: true },
    },
    {
      id: 'senior_org_counts',
      placement: { colSpan: 3, colStart: 10, rowStart: 2, stretch: true },
    },
    {
      id: 'senior_role_counts',
      placement: { colSpan: 3, colStart: 10, rowStart: 3, stretch: true },
    },
    // دسترسی گزارش‌ها: دقیقاً زیر «وضعیت پرونده‌ها» (هم‌ستون و هم‌عرض)، ردیف ۳.
    {
      id: 'senior_report_access',
      placement: { colSpan: 5, colStart: 5, rowStart: 3, stretch: true },
    },
    {
      id: 'senior_published',
      placement: { colSpan: 4, colStart: 1, rowStart: 3, stretch: true },
    },
  ];
  return slots;
}

/**
 * ارزیابی (استاد راهنما / مدیر مدرسه / استاد ناظر): خوش‌آمد تمام‌عرض؛ اطلاعیه‌ها ردیف ۲
 * (نیمه‌عرض، یا تمام‌عرض وقتی تبلیغ هست و میانگین نمره نیست)؛
 * میانگین نمرهٔ دروس کنار اطلاعیه‌ها (نیمهٔ چپ، ردیف‌های ۲-۳)؛
 * با تبلیغ: کارت نمرات زیر خودِ تبلیغ در ترک ۲۴۰px، تعداد فراگیران/ترمی‌پودمانی
 * یک ردیف پایین‌تر؛ بدون تبلیغ: نمرات یک ردیف زیر ستون تعداد.
 */
function evaluationSlots(
  showAd: boolean,
  showTeacherCount: boolean,
  showCourseAverages = false,
  showCourseCapacities = false,
  showCoursePendingReports = false,
  showStudentGradeRanking = false,
  showStudentGradesCard = false,
  showPendingBesideAnnouncements = false
): WorkbenchBoxSlot[] {
  // معلم راهنما: «برترین/ضعیف‌ترین» زیر «در انتظار بررسی» (ستون راست) و اطلاعیه‌ها بلندتر
  // (دو ردیف، هم‌قدِ این دو)؛ «تعداد فراگیران» یک ردیف پایین‌تر و تمام‌عرض.
  const rankingBesidePending =
    showPendingBesideAnnouncements &&
    showStudentGradeRanking &&
    !showCourseAverages;
  // با تبلیغ، نمرات زیر خودِ تبلیغ‌اند (داخل سلول تبلیغ).
  const gradesBelowAd = showAd && showStudentGradesCard;
  const learnerCountsPlacement: WorkbenchBoxPlacement = showAd
    ? // زیر سلول تبلیغ (تبلیغ + نمره روی ردیف‌های ۱–۳).
      { colSpan: 1, colStart: 13, rowStart: gradesBelowAd ? 4 : 3 }
    : rankingBesidePending
      ? { colSpan: 12, colStart: 1, rowStart: 4 }
      : showCourseAverages
        ? // با «برترین/ضعیف‌ترین فراگیران» (ردیف ۳ زیر اطلاعیه‌ها)، شمار فراگیران یک ردیف پایین‌تر.
          {
            colSpan: 6,
            colStart: 1,
            rowStart: showStudentGradeRanking
              ? showCoursePendingReports
                ? 5
                : 4
              : 3,
          }
        : showPendingBesideAnnouncements
          ? // «در انتظار بررسی» نیمهٔ چپ ردیف ۲ را می‌گیرد؛ شمار فراگیران یک ردیف پایین‌تر.
            { colSpan: 6, colStart: 7, rowStart: 3 }
          : { colSpan: 6, colStart: 7, rowStart: 2, height: 'learnerAnnounce' };

  const slots: WorkbenchBoxSlot[] = [
    {
      id: 'welcome',
      placement: { colSpan: 12, colStart: 1, rowStart: 1, height: 'welcome' },
    },
    {
      id: 'announcements',
      placement: {
        // با تبلیغ (و بدون میانگین نمره)، اطلاعیه‌ها کل ردیف ۲ را می‌گیرند؛
        // با میانگین نمره (یا «در انتظار بررسی» کنارشان)، نیمهٔ راست می‌مانند.
        colSpan:
          showAd && !showCourseAverages && !showPendingBesideAnnouncements
            ? 12
            : 6,
        colStart: 1,
        rowStart: 2,
        ...(rankingBesidePending
          ? { rowSpan: 2, stretch: true }
          : { height: 'learnerAnnounce' as const }),
      },
    },
  ];
  // معلم راهنما / مدیر مدرسه: «در انتظار بررسی» کنار اطلاعیه‌ها، هم‌ردیف و هم‌قد آن‌ها.
  if (showPendingBesideAnnouncements) {
    slots.push({
      id: 'course_pending_reports',
      placement: {
        colSpan: 6,
        colStart: 7,
        rowStart: 2,
        height: 'learnerAnnounce',
      },
    });
  }
  // کارت‌های دانشجو / مهارت‌آموز: وقتی باکس «ترمی / پودمانی» هست جایشان را به آن می‌دهند.
  if (!showCourseCapacities) {
    slots.push({
      id: 'learner_counts',
      placement: learnerCountsPlacement,
    });
  }
  // استاد راهنما: «در حال بررسی» بالای میانگین در همان سلول.
  // معلم / مدیر مدرسه: فقط کنار اطلاعیه‌ها (`showPendingBesideAnnouncements`) — تکرار نشود.
  const pendingAboveAverages =
    showCoursePendingReports &&
    showCourseAverages &&
    !showPendingBesideAnnouncements;
  if (showCourseAverages) {
    // با «در حال بررسی»: یک سلول مستقل (گرید‌اریای خودش) روی ردیف‌های ۲ تا ۴ — کارت‌های
    // «در حال بررسی» بالا و نمودار میانگین درست زیرشان؛ ردیف‌های ستون چپ (اطلاعیه‌ها /
    // برترین‌ها) روی فاصلهٔ بینشان اثر ندارند. بدون آن: کنار اطلاعیه‌ها، ردیف‌های ۲ و ۳.
    slots.push({
      id: 'course_averages',
      placement: {
        colSpan: 6,
        colStart: 7,
        // معلم/مدیر: ردیف ۲ را «در انتظار بررسی» گرفته؛ میانگین زیر آن.
        rowStart: showPendingBesideAnnouncements ? 3 : 2,
        rowSpan: pendingAboveAverages ? 3 : 2,
        stretch: true,
      },
      ...(pendingAboveAverages
        ? { includes: ['course_pending_reports'] as const }
        : {}),
    });
  }
  if (showCourseCapacities) {
    // باکس «ترمی / پودمانی» دقیقاً جای کارت‌های دانشجو / مهارت‌آموز.
    slots.push({
      id: 'course_capacities',
      placement: learnerCountsPlacement,
    });
  }
  // ردیفِ آخرین باکسِ ستونِ تعداد (ترمی/پودمانی یا کارت‌های فراگیران).
  const learnerCountsRow = learnerCountsPlacement.rowStart ?? 2;
  if (showStudentGradesCard && !gradesBelowAd) {
    // بدون تبلیغ: کارت نمرات یک ردیف زیر ستون تعداد، هم‌ستون و هم‌عرض.
    slots.push({
      id: 'student_grades_card',
      placement: {
        colSpan: learnerCountsPlacement.colSpan,
        colStart: learnerCountsPlacement.colStart,
        rowStart: learnerCountsRow + 1,
      },
    });
  }
  const countsBottom =
    showStudentGradesCard && !gradesBelowAd
      ? learnerCountsRow + 1
      : learnerCountsRow;
  const lastRow = showStudentGradeRanking
    ? Math.max(countsBottom, 3)
    : countsBottom;
  // با میانگین نمره، «در حال بررسی» داخل سلول همان نمودار می‌آید (`includes` بالا).
  // با `showPendingBesideAnnouncements` اسلات جدا کنار اطلاعیه‌ها از قبل اضافه شده.
  if (
    showCoursePendingReports &&
    !pendingAboveAverages &&
    !showPendingBesideAnnouncements
  ) {
    // بدون میانگین نمره: تمام‌عرض، یک ردیف زیر آخرین باکس بالایی.
    slots.push({
      id: 'course_pending_reports',
      placement: { colSpan: 12, colStart: 1, rowStart: lastRow + 1 },
    });
  }
  if (showStudentGradeRanking) {
    // درست زیر اطلاعیه‌ها (ردیف ۳)، هم‌عرض آن‌ها.
    slots.push({
      id: 'student_grade_ranking',
      placement: {
        colSpan:
          showAd && !showCourseAverages && !rankingBesidePending ? 12 : 6,
        colStart: rankingBesidePending ? 7 : 1,
        rowStart: 3,
        // ردیف‌های ۳ و ۴ — هم‌قد ستون راست («در حال بررسی» + نمودار میانگین).
        ...(pendingAboveAverages ? { rowSpan: 2, stretch: true } : {}),
      },
    });
  }
  if (showTeacherCount) {
    slots.push({
      id: 'teacher_count',
      placement: { colSpan: 6, colStart: 1, rowStart: 3 },
    });
  }
  if (showAd) {
    slots.push({
      id: 'ad',
      placement: {
        colSpan: 1,
        colStart: 13,
        rowStart: 1,
        // با کارت نمرات زیر تبلیغ، ستون ردیف‌های ۱–۳ را می‌گیرد.
        rowSpan: gradesBelowAd ? 3 : 2,
      },
      ...(gradesBelowAd ? { includes: ['student_grades_card'] as const } : {}),
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
      return evaluationSlots(
        showAd,
        options.showTeacherCount === true,
        options.showCourseAverages === true,
        options.showCourseCapacities === true,
        options.showCoursePendingReports === true,
        options.showStudentGradeRanking === true,
        options.showStudentGradesCard === true,
        options.showPendingBesideAnnouncements === true
      );
    default:
      // سازمان مرکزی دقیقاً همان لی‌اوت دانشگاه استانی را دارد (خوش‌آمد، اطلاعیه‌ها، تبلیغ).
      return classicSlots(
        showAd,
        options.showRegionalCounts === true,
        role === 'central_organization'
      );
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

/**
 * سطح باکس‌های میز کار: در حالت عادی پُر؛ در حالت خالی (empty state)
 * بدون پس‌زمینه و با بردر خط‌چین. اندازهٔ باکس در هر دو حالت یکی می‌ماند.
 * ضخامت بردر (`border`) و گردی گوشه را خود باکس می‌دهد.
 */
export function workbenchBoxToneClass(
  isEmpty: boolean,
  filledBorder: 'soft' | 'default' = 'soft'
): string {
  if (isEmpty) {
    return 'border-dashed border-kv-border-strong bg-transparent shadow-none';
  }
  return filledBorder === 'soft'
    ? 'border-kv-border/70 bg-kv-surface shadow-kv-soft'
    : 'border-kv-border bg-kv-surface shadow-kv-soft';
}
