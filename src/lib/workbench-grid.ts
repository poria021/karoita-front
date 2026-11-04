import type { CSSProperties } from 'react';

/**
 * گرید میز کار — دسکتاپ همان اندازه‌های قبلی؛ موبایل تک‌ستونه و جمع می‌شود.
 *
 * md+: خوش‌آمد (1fr) | اطلاعیه‌ها (1.35fr) | تبلیغ (۳۰۰px ثابت)
 * موبایل: یک ستون، روی هم
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
