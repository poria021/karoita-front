import type { CSSProperties } from 'react';

/**
 * گرید مشترک ماژول میز کار همهٔ پنل‌ها — یک ریتم ستون/فاصله برای ویجت‌ها و میان‌برها.
 * از md به بالا: خوش‌آمد | اطلاعیه‌ها | تبلیغ با عرض ثابت.
 */
export const WORKBENCH_GRID_CLASS =
  'grid w-full grid-cols-1 gap-kv-group md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_auto] md:items-start';

/**
 * ارتفاع ثابت مشترک خوش‌آمد و اطلاعیه‌ها — کمتر از باکس تبلیغ (۳۳۰px).
 * تبلیغ جدا و بلندتر می‌ماند؛ این دو ستون هم‌ارتفاع و کوتاه‌ترند.
 */
export const WORKBENCH_SIDE_PANEL_HEIGHT_PX = 240;

export const WORKBENCH_SIDE_PANEL_STYLE: CSSProperties = {
  height: WORKBENCH_SIDE_PANEL_HEIGHT_PX,
  minHeight: WORKBENCH_SIDE_PANEL_HEIGHT_PX,
  maxHeight: WORKBENCH_SIDE_PANEL_HEIGHT_PX,
};

/** خوش‌آمد — ستون راست (اول در RTL). */
export const WORKBENCH_WELCOME_SPAN = 'min-h-0 min-w-0';

/** اطلاعیه‌ها — وسط؛ هم‌ارتفاع با خوش‌آمد. */
export const WORKBENCH_ANNOUNCEMENTS_SPAN = 'min-h-0 min-w-0';

/**
 * تبلیغ سایدبار — ستون چپ (آخر در RTL).
 * خودِ باکس ۳۰۰×۳۳۰ ثابت است؛ این سلول فقط جایش را در گرید مشخص می‌کند.
 */
export const WORKBENCH_AD_SPAN =
  'w-[300px] shrink-0 justify-self-center md:justify-self-end';

/** ردیف تمام‌عرض زیر ویجت‌های بالا (چک‌لیست، میان‌برها، …). */
export const WORKBENCH_FULL_SPAN = 'min-w-0 md:col-span-full';

/** گرید داخلی میان‌برها — هم‌ریتم با گرید اصلی. */
export const WORKBENCH_SHORTCUTS_GRID_CLASS =
  'grid list-none gap-kv-group sm:grid-cols-2 lg:grid-cols-3';
