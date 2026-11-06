import type { CSSProperties } from 'react';

/**
 * گرید میز کار — دسکتاپ همان اندازه‌های قبلی؛ موبایل تک‌ستونه و جمع می‌شود.
 *
 * md+ (نقش‌های سازمانی باقی‌مانده): خوش‌آمد (1fr) | اطلاعیه‌ها (1.35fr) | تبلیغ
 * فراگیر: گرید پشته‌ای خوش‌آمد + (اطلاعیه|جزوه) | تبلیغ؟
 * مدیر ارشد / دستیار: (خوش‌آمد | ساختار+نقش‌ها) سپس پرونده‌ها | بدون تبلیغ
 * استاد/معلم/مدیر مدرسه: لی‌اوت یکسان — خوش‌آمد، اطلاعیه|مانیتورینگ، تبلیغ؛ ظرفیت فقط استاد
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

/**
 * ارتفاع باکس مانیتورینگ:
 * p-kv-group×۲ + هدر + gap-kv-group + ریل کارت + pb-kv-pair (فاصله تا اسکرول‌بار).
 */
export const WORKBENCH_MONITOR_PANEL_HEIGHT_PX = 188;

export const WORKBENCH_MONITOR_PANEL_STYLE: CSSProperties = {
  height: WORKBENCH_MONITOR_PANEL_HEIGHT_PX,
  minHeight: WORKBENCH_MONITOR_PANEL_HEIGHT_PX,
  maxHeight: WORKBENCH_MONITOR_PANEL_HEIGHT_PX,
};

/** فاصلهٔ عمودی ستون راست دانشجو (`gap-kv-group` = 1rem). */
export const WORKBENCH_LEARNER_STACK_GAP_PX = 16;

/** ارتفاع فشردهٔ خوش‌آمد (نام + استان/دانشکده). */
export const WORKBENCH_LEARNER_WELCOME_HEIGHT_PX = 112;

export const WORKBENCH_LEARNER_WELCOME_STYLE: CSSProperties = {
  height: WORKBENCH_LEARNER_WELCOME_HEIGHT_PX,
  minHeight: WORKBENCH_LEARNER_WELCOME_HEIGHT_PX,
  maxHeight: WORKBENCH_LEARNER_WELCOME_HEIGHT_PX,
};

/** ارتفاع هدف وضعیت پرونده‌ها روی دسکتاپ — ۳ برابر خوش‌آمد. */
export const WORKBENCH_SENIOR_ONBOARDING_HEIGHT_PX =
  WORKBENCH_LEARNER_WELCOME_HEIGHT_PX * 3;

/** ارتفاع هدف ساختار سازمانی — سه‌پنجم وضعیت پرونده‌ها. */
export const WORKBENCH_SENIOR_ORG_STRUCTURE_HEIGHT_PX =
  (WORKBENCH_SENIOR_ONBOARDING_HEIGHT_PX * 3) / 5;

/**
 * وضعیت پرونده‌ها — ارتفاع محتوا (بدون فضای خالی عمودی)؛ md+ عرض برابر محتوا.
 */
export const WORKBENCH_SENIOR_ONBOARDING_CLASS =
  'h-auto w-full max-w-full md:w-fit';

/**
 * ساختار سازمانی — کنار وضعیت پرونده‌ها؛ کارت‌ها عریض‌تر از مربع قبلی.
 */
export const WORKBENCH_SENIOR_ORG_STRUCTURE_CLASS =
  'h-auto min-h-[14rem] w-full max-w-full md:h-[14rem] md:w-[24rem] md:min-w-[24rem] md:max-w-[24rem]';

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
 * میز کار پشته‌ای فراگیر:
 * ستون راست (خوش‌آمد + اطلاعیه|جزوه) | تبلیغ باریک (spot اختیاری).
 */
export const WORKBENCH_LEARNER_TOP_GRID_CLASS =
  'grid w-full grid-cols-1 gap-kv-group md:grid-cols-[minmax(0,1fr)_240px] md:items-start';

/** همان پشته بدون ستون تبلیغ — محتوا تمام‌عرض می‌شود. */
export const WORKBENCH_LEARNER_TOP_GRID_NO_AD_CLASS =
  'grid w-full grid-cols-1 gap-kv-group md:items-start';

/** ستون راست پشته‌ای فراگیر: خوش‌آمد و ردیف اطلاعیه/جزوه زیر هم. */
export const WORKBENCH_LEARNER_STACK_CLASS =
  'flex min-w-0 flex-col gap-kv-group';

/**
 * ردیف اطلاعیه + باکس کناری (جزوه / وضعیت پرونده) زیر خوش‌آمد.
 * موبایل: زیر هم؛ md+: اطلاعیه پهن‌تر (۱.۵) ، کناری باریک‌تر (۱).
 */
export const WORKBENCH_LEARNER_INBOX_ROW_CLASS =
  'grid min-h-0 min-w-0 w-full grid-cols-1 gap-kv-group md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]';

/**
 * ردیف مجزای وضعیت پرونده‌ها | ستون ساختار + نقش‌ها.
 */
export const WORKBENCH_SENIOR_CASES_ORG_ROW_CLASS =
  'grid min-h-0 min-w-0 w-full grid-cols-1 gap-kv-group md:grid-cols-[max-content_auto] md:items-start';

/**
 * ستون ساختار سازمانی + آمار نقش‌ها زیر آن.
 */
export const WORKBENCH_SENIOR_ORG_STRUCTURE_STACK_CLASS =
  'flex min-w-0 w-full flex-col gap-kv-group md:w-fit md:justify-self-end';

/**
 * شمار نقش‌ها — هم‌عرض ساختار سازمانی عریض‌تر.
 */
export const WORKBENCH_SENIOR_ROLE_COUNTS_CLASS =
  'h-auto min-h-[16rem] w-full max-w-full md:h-[18.9rem] md:min-h-[18.9rem] md:w-[24rem]';

/**
 * میز کار استاد / معلم راهنما / مدیر — لی‌اوت یکسان، ۴ ستون محتوا + تبلیغ:
 * [خوش‌آمد ×۴]                         [تبلیغ ↕]
 * [اطلاعیه ×۲] [مانیتورینگ ×۲]         [تبلیغ]
 * [ظرفیت ×۲] فقط استاد راهنما          …
 */
export const WORKBENCH_EVALUATION_TOP_GRID_CLASS =
  'grid w-full min-w-0 grid-cols-1 gap-kv-group md:grid-cols-[repeat(4,minmax(0,1fr))_240px] md:items-start';

/** همان گرید ارزیابی بدون ستون تبلیغ. */
export const WORKBENCH_EVALUATION_TOP_GRID_NO_AD_CLASS =
  'grid w-full min-w-0 grid-cols-1 gap-kv-group md:grid-cols-4 md:items-start';

/**
 * میز کار کلاسیک (نقش‌های سازمانی): خوش‌آمد | اطلاعیه | تبلیغ؟
 * وقتی تبلیغ نیست، دو ستون محتوا تمام‌عرض می‌شوند.
 */
export const WORKBENCH_CLASSIC_TOP_GRID_CLASS =
  'grid w-full grid-cols-1 gap-kv-group md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_auto] md:items-start';

export const WORKBENCH_CLASSIC_TOP_GRID_NO_AD_CLASS =
  'grid w-full grid-cols-1 gap-kv-group md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:items-start';

export const WORKBENCH_EVAL_WELCOME_CELL =
  'min-h-0 min-w-0 w-full md:col-span-4 md:col-start-1 md:row-start-1';

export const WORKBENCH_EVAL_AD_CELL =
  'w-full max-w-[240px] justify-self-center md:col-start-5 md:row-start-1 md:row-span-2 md:w-[240px] md:max-w-none md:justify-self-end';

/** اطلاعیه کنار مانیتورینگ: ۲ از ۴ ستون محتوا — مشترک هر سه نقش. */
export const WORKBENCH_EVAL_ANNOUNCEMENTS_CELL =
  'min-h-0 min-w-0 w-full overflow-hidden md:col-span-2 md:col-start-1 md:row-start-2';

/** مانیتورینگ کنار اطلاعیه: ۲ از ۴ ستون — مشترک هر سه نقش. */
export const WORKBENCH_EVAL_MONITOR_BESIDE_CELL =
  'min-h-0 min-w-0 w-full overflow-hidden md:col-span-2 md:col-start-3 md:row-start-2';

/** ظرفیت زیر اطلاعیه (فقط استاد راهنما): هم‌عرض اطلاعیه. */
export const WORKBENCH_EVAL_CAPACITY_CELL =
  'min-h-0 min-w-0 w-full overflow-hidden md:col-span-2 md:col-start-1 md:row-start-3';

/** خوش‌آمد — ستون راست (اول در RTL) برای گرید ۳ستونهٔ کلاسیک */
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
