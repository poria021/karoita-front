/**
 * فوکوس/تراکم کروم شل که نمی‌تواند `KvButton` باشد
 * (مثلاً `DropdownMenuTrigger asChild` با لایوت مرکب، استاب قفل ناوبار).
 */
export const kvShellFocusRingClassName =
  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20';

/** پد فشردهٔ ردیف اورلی — همان تراکم آیتم سلکت/منو. */
export const kvShellOverlayRowPadClassName = 'px-kv-inline py-kv-nav';

/**
 * اینست افقی ردیف بدنهٔ داشبورد (سایدبار + `main`).
 * موبایل تمام‌عرض (`px-0`) تا `main` ویوپورت را بگیرد؛ از تبلت حاشیه با مقیاس شل.
 */
export const kvShellContentPadXClassName =
  'px-0 sm:px-kv-section lg:px-kv-section xl:px-kv-page 2xl:px-kv-screen';

/**
 * دانشجو / مهارت‌آموز — محتوای هدر و ردیف سایدبار+اصلی (نوار هدر فول‌ویدث می‌ماند).
 * ۱۴۴۰px یک پله از ۷xl بازتر است؛ ادمین و نقش‌های سازمانی تمام‌عرض می‌مانند.
 */
export const kvShellLearnerDashboardWidthClassName =
  'mx-auto w-full max-w-[90rem]';

/**
 * اینست محتوای هدر — پد کم موبایل تا کنترل به لبه نچسبد؛ از `sm` همان حاشیهٔ ردیف بدنه.
 */
export const kvShellHeaderPadXClassName =
  'px-kv-inline sm:px-kv-section lg:px-kv-section xl:px-kv-page 2xl:px-kv-screen';

/**
 * اینست هدر ادمین — `pe` (چپ RTL / خوشهٔ کاربر) با `p-kv-group` برند ریل از لبهٔ شروع ویوپورت یکی است.
 */
export const kvShellAdminHeaderPadXClassName = 'px-kv-group';

/**
 * ساعت جمع‌شدن نرم — ease-out بلندتر تا لیبل، عرض ریل و پد هدر/`main` با هم کند شوند نه در ۳۰۰ms بپرند.
 */
export const kvShellAdminRailMotionClassName =
  'duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';

export const kvShellAdminRailWidthMotionClassName =
  'transition-[width,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';

export const kvShellAdminRailClearanceMotionClassName =
  'transition-[padding-inline-start] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';

/** لیبل کنار آیکن ریل (ناو، حساب، وردمارک) — همان ساعت عرض ریل. */
export const kvShellRailLabelMotionClassName =
  'overflow-hidden transition-[max-width,max-height,margin-inline-start,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';

/**
 * اندازهٔ تایپ ریل — `compact` کارت نقش‌های سازمانی؛ `legible` ریل ستادی (≥۱۴px، بدون scale).
 */
export type KvShellRailTextSize = 'compact' | 'legible';

export const kvShellRailNavTypeClassName: Record<KvShellRailTextSize, string> = {
  compact: 'text-xs leading-snug',
  legible: 'text-sm leading-snug',
};

export const kvShellRailLabelMaxClassName: Record<KvShellRailTextSize, string> =
  {
    compact: 'max-w-[150px]',
    legible: 'max-w-[11.5rem]',
  };

export const kvShellAdminRailExpandedClassName = 'lg:ps-72';
export const kvShellAdminRailCollapsedClassName = 'lg:ps-24';

/** ریل ادمین `fixed` در لبهٔ شروع (RTL = راست). پد نه مارجین تا `w-full` از ویوپورت بیرون نزند. موبایل تمام‌عرض؛ ریل آنجا دراور است. */
export function kvShellAdminRailClearanceClassName(isCollapsed: boolean) {
  return isCollapsed
    ? kvShellAdminRailCollapsedClassName
    : kvShellAdminRailExpandedClassName;
}

/**
 * گاتر فقط روی `main` ستون ادمین — همان `kv-group` دو طرف (RTL: از ریل و لبهٔ چپ صفحه). هدر به ریل می‌چسبد.
 */
export const kvShellAdminMainGutterClassName = 'px-0 sm:px-kv-group';

/** خط موی فوتر محصول — `main` داشبورد + کارت احراز. */
export const kvProductFooterBorderClassName = 'border-t border-kv-border';

/** جداکننده زیر ترک تب، روی بدنهٔ محتوا. */
export const kvTabsBodyBorderClassName = 'border-t border-kv-border';
