import type { CSSProperties } from 'react';

/**
 * گرید میز کار — دسکتاپ همان اندازه‌های قبلی؛ موبایل تک‌ستونه و جمع می‌شود.
 *
 * md+ (پیش‌فرض نقش‌های دیگر): خوش‌آمد (1fr) | اطلاعیه‌ها (1.35fr) | تبلیغ (۳۰۰px ثابت)
 * دانشجو/مهارت‌آموز: گرید تودرتو در `DashboardBulletinsBoard`
 *   ستون راست: خوش‌آمد کوتاه + اطلاعیه‌ها زیر هم
 *   ستون چپ: تبلیغ
 */
export const WORKBENCH_GRID_CLASS =
  'grid w-full grid-cols-1 gap-kv-group md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_auto] md:items-start';

/**
 * ارتفاع مشترک خوش‌آمد و اطلاعیه‌ها — کوتاه‌تر از تبلیغ ۳۰۰×۴۰۰ (نسبت ۳:۴).
 */
export const WORKBENCH_SIDE_PANEL_HEIGHT_PX = 240;

export const WORKBENCH_SIDE_PANEL_STYLE: CSSProperties = {
  height: WORKBENCH_SIDE_PANEL_HEIGHT_PX,
  minHeight: WORKBENCH_SIDE_PANEL_HEIGHT_PX,
  maxHeight: WORKBENCH_SIDE_PANEL_HEIGHT_PX,
};

/** ارتفاع تبلیغ ۳۰۰×۴۰۰ (نسبت ۳:۴). */
export const WORKBENCH_AD_HEIGHT_PX = 400;

/** فاصلهٔ عمودی ستون راست دانشجو (`gap-kv-group` = 1rem). */
export const WORKBENCH_LEARNER_STACK_GAP_PX = 16;

/** ارتفاع فشردهٔ خوش‌آمد دانشجو/مهارت‌آموز (فقط نام + یک خط توضیح). */
export const WORKBENCH_LEARNER_WELCOME_HEIGHT_PX = 112;

export const WORKBENCH_LEARNER_WELCOME_STYLE: CSSProperties = {
  height: WORKBENCH_LEARNER_WELCOME_HEIGHT_PX,
  minHeight: WORKBENCH_LEARNER_WELCOME_HEIGHT_PX,
  maxHeight: WORKBENCH_LEARNER_WELCOME_HEIGHT_PX,
};

/**
 * ارتفاع اطلاعیه‌های دانشجو — خوش‌آمد + فاصله + اطلاعیه = ارتفاع تبلیغ.
 */
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
 * میز کار دانشجو/مهارت‌آموز: ستون راست (خوش‌آمد+اطلاعیه) | تبلیغ ۳۰۰px.
 */
export const WORKBENCH_LEARNER_TOP_GRID_CLASS =
  'grid w-full grid-cols-1 gap-kv-group md:grid-cols-[minmax(0,1fr)_300px] md:items-start';

/** ستون راست دانشجو: خوش‌آمد و اطلاعیه‌ها زیر هم. */
export const WORKBENCH_LEARNER_STACK_CLASS =
  'flex min-w-0 flex-col gap-kv-group';

/** خوش‌آمد — ستون راست (اول در RTL) */
export const WORKBENCH_WELCOME_SPAN = 'min-h-0 min-w-0 w-full';

/** اطلاعیه‌ها — وسط */
export const WORKBENCH_ANNOUNCEMENTS_SPAN = 'min-h-0 min-w-0 w-full';

/**
 * تبلیغ — ستون چپ (آخر در RTL).
 * دسکتاپ: سلول auto به عرض ۳۰۰px؛ موبایل: سقف ۳۰۰ و وسط‌چین.
 */
export const WORKBENCH_AD_SPAN =
  'w-full max-w-[300px] justify-self-center md:w-[300px] md:max-w-none md:justify-self-end';

/** ردیف تمام‌عرض (چک‌لیست، میان‌برها، …) */
export const WORKBENCH_FULL_SPAN = 'min-w-0 md:col-span-full';

/** گرید داخلی میان‌برها */
export const WORKBENCH_SHORTCUTS_GRID_CLASS =
  'grid list-none gap-kv-group sm:grid-cols-2 lg:grid-cols-3';
