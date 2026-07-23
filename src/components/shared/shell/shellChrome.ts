/**
 * Shared focus / density recipes for shell chrome that cannot use KvButton
 * (e.g. DropdownMenuTrigger asChild with composite layout, locked nav stubs).
 */
export const kvShellFocusRingClassName =
  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20';

/** Compact overlay row padding — matches select/menu item density. */
export const kvShellOverlayRowPadClassName = 'px-kv-inline py-kv-nav';
