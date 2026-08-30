/**
 * Shared focus / density recipes for shell chrome that cannot use KvButton
 * (e.g. DropdownMenuTrigger asChild with composite layout, locked nav stubs).
 */
export const kvShellFocusRingClassName =
  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20';

/** Compact overlay row padding — matches select/menu item density. */
export const kvShellOverlayRowPadClassName = 'px-kv-inline py-kv-nav';

/**
 * Horizontal inset for the dashboard body row (sidebar + main).
 * Mobile: full-bleed (`px-0`) so main spans the viewport.
 * Tablet+: start/end margins aligned with the shell scale.
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
 * Header content inset — slight mobile pad so controls are not flush to the edge;
 * from `sm` matches the body row margins.
 */
export const kvShellHeaderPadXClassName =
  'px-kv-inline sm:px-kv-section lg:px-kv-section xl:px-kv-page 2xl:px-kv-screen';

/**
 * Admin header inset — `pe` (RTL left / user cluster) matches the rail
 * brand `p-kv-group` from the viewport start edge (RTL right / logo).
 */
export const kvShellAdminHeaderPadXClassName = 'px-kv-group';

/**
 * Admin rail is `fixed` on the inline-start edge (RTL = right).
 * Padding — not margin — so `w-full` stays inside the viewport
 * (`width: 100%` + start margin was overflowing and creating both
 * scrollbars). Mobile stays full-bleed; the rail is a drawer there.
 */
/**
 * Soft collapse clock — longer ease-out so labels, rail width, and
 * header/main pad decelerate together instead of snapping at 300ms.
 */
export const kvShellAdminRailMotionClassName =
  'duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';

export const kvShellAdminRailWidthMotionClassName =
  'transition-[width,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';

export const kvShellAdminRailClearanceMotionClassName =
  'transition-[padding-inline-start] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';

/** Labels next to rail icons (nav, account, wordmark) — same clock as rail width. */
export const kvShellRailLabelMotionClassName =
  'overflow-hidden transition-[max-width,max-height,margin-inline-start,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';

export const kvShellAdminRailExpandedClassName = 'lg:ps-72';
export const kvShellAdminRailCollapsedClassName = 'lg:ps-24';

export function kvShellAdminRailClearanceClassName(isCollapsed: boolean) {
  return isCollapsed
    ? kvShellAdminRailCollapsedClassName
    : kvShellAdminRailExpandedClassName;
}

/**
 * Main-only gutters in the admin column — same `kv-group` on both sides
 * (RTL: from the rail and from the left page edge). Header stays flush
 * to the rail.
 */
export const kvShellAdminMainGutterClassName = 'px-0 sm:px-kv-group';

/** Rail overflow chrome — hidden until hover; see `.kv-sidebar-hover-scroll`. */
export const kvShellSidebarHoverScrollClassName = 'kv-sidebar-hover-scroll';

/** Shared product footer hairline — dashboard main + auth cards. */
export const kvProductFooterBorderClassName = 'border-t border-kv-border';

/** Separator under the tab track, on the content body. */
export const kvTabsBodyBorderClassName = 'border-t border-kv-border';
