import type { CSSProperties } from 'react';

/**
 * گرید میز کار — دسکتاپ همان اندازه‌های قبلی؛ موبایل تک‌ستونه و جمع می‌شود.
 *
 * md+ (پیش‌فرض نقش‌های دیگر): خوش‌آمد (1fr) | اطلاعیه‌ها (1.35fr) | تبلیغ (عرض ثابت)
 * دانشجو/مهارت‌آموز: گرید تودرتو در `DashboardBulletinsBoard`
 *   ستون راست: خوش‌آمد کوتاه + ردیف (اطلاعیه | جزوه) زیر هم
 *   ستون چپ: تبلیغ
 */

/**
 * عرض باریک‌تر سایدبار؛ ارتفاع قبلی حفظ می‌شود (۲۴۰×۳۲۰، نسبت ۳:۴).
 */
export const WORKBENCH_AD_WIDTH_PX = 240;

/** ارتفاع تبلیغ سایدبار — همان ارتفاع قبلی، فقط عرض کمتر شده. */
export const WORKBENCH_AD_HEIGHT_PX = 320;

/** کلاس نسبت تصویر تبلیغ — همیشه با `WORKBENCH_AD_*` یکی بماند. */
export const WORKBENCH_AD_ASPECT_CLASS = 'aspect-[3/4]';

export const WORKBENCH_GRID_CLASS =
  'grid w-full grid-cols-1 gap-kv-group md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_auto] md:items-start';

/**
 * ارتفاع مشترک خوش‌آمد و اطلاعیه‌ها در پنل‌های غیر فراگیر —
 * کوتاه‌تر از تبلیغ ۲۴۰×۳۲۰.
 */
export const WORKBENCH_SIDE_PANEL_HEIGHT_PX = 200;

export const WORKBENCH_SIDE_PANEL_STYLE: CSSProperties = {
  height: WORKBENCH_SIDE_PANEL_HEIGHT_PX,
  minHeight: WORKBENCH_SIDE_PANEL_HEIGHT_PX,
  maxHeight: WORKBENCH_SIDE_PANEL_HEIGHT_PX,
};

/** فاصلهٔ عمودی ستون راست دانشجو (`gap-kv-group` = 1rem). */
export const WORKBENCH_LEARNER_STACK_GAP_PX = 16;

/** ارتفاع فشردهٔ خوش‌آمد دانشجو/مهارت‌آموز (نام + استان/دانشکده + یک خط توضیح). */
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
 * میز کار دانشجو/مهارت‌آموز: ستون راست (خوش‌آمد + اطلاعیه|جزوه) | تبلیغ باریک.
 */
export const WORKBENCH_LEARNER_TOP_GRID_CLASS =
  'grid w-full grid-cols-1 gap-kv-group md:grid-cols-[minmax(0,1fr)_240px] md:items-start';

/** ستون راست دانشجو: خوش‌آمد و ردیف اطلاعیه/جزوه زیر هم. */
export const WORKBENCH_LEARNER_STACK_CLASS =
  'flex min-w-0 flex-col gap-kv-group';

/**
 * ردیف اطلاعیه + جزوه کنار هم زیر خوش‌آمد فراگیر.
 * موبایل: زیر هم؛ md+: اطلاعیه پهن‌تر (۱.۵) ، جزوه باریک‌تر (۱).
 */
export const WORKBENCH_LEARNER_INBOX_ROW_CLASS =
  'grid min-h-0 min-w-0 w-full grid-cols-1 gap-kv-group md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]';

/** خوش‌آمد — ستون راست (اول در RTL) */
export const WORKBENCH_WELCOME_SPAN = 'min-h-0 min-w-0 w-full';

/** اطلاعیه‌ها / جزوه‌ها — سلول‌های ردیف اینباکس */
export const WORKBENCH_ANNOUNCEMENTS_SPAN = 'min-h-0 min-w-0 w-full';

/**
 * تبلیغ — ستون چپ (آخر در RTL).
 * دسکتاپ: سلول auto به عرض ۲۴۰px؛ موبایل: سقف همان عرض و وسط‌چین.
 */
export const WORKBENCH_AD_SPAN =
  'w-full max-w-[240px] justify-self-center md:w-[240px] md:max-w-none md:justify-self-end';

/** ردیف تمام‌عرض (چک‌لیست، میان‌برها، …) */
export const WORKBENCH_FULL_SPAN = 'min-w-0 md:col-span-full';

/** گرید داخلی میان‌برها */
export const WORKBENCH_SHORTCUTS_GRID_CLASS =
  'grid list-none gap-kv-group sm:grid-cols-2 lg:grid-cols-3';
