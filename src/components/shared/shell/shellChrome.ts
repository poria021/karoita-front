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
 * Header content inset — slight mobile pad so controls are not flush to the edge;
 * from `sm` matches the body row margins.
 */
export const kvShellHeaderPadXClassName =
  'px-kv-inline sm:px-kv-section lg:px-kv-section xl:px-kv-page 2xl:px-kv-screen';

/** Shared product footer hairline — dashboard main + auth cards. */
export const kvProductFooterBorderClassName = 'border-t border-kv-border';

/** Separator under the tab track, on the content body. */
export const kvTabsBodyBorderClassName = 'border-t border-kv-border';
