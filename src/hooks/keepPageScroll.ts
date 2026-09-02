const UNLOCK_STYLES: Array<[string, string]> = [
  ['overflow', 'auto'],
  ['overflow-x', 'visible'],
  ['overflow-y', 'auto'],
  ['margin-right', '0px'],
  ['margin-left', '0px'],
  ['padding-right', '0px'],
  ['padding-left', '0px'],
  ['overscroll-behavior', 'auto'],
];

let lockCount = 0;

function hasBlockingDialog(): boolean {
  return Boolean(
    document.querySelector(
      '[data-slot="dialog-overlay"], [data-slot="alert-dialog-overlay"]'
    )
  );
}

function applyUnlock(el: HTMLElement) {
  for (const [property, value] of UNLOCK_STYLES) {
    el.style.setProperty(property, value, 'important');
  }
  el.style.setProperty('--removed-body-scroll-bar-size', '0px');
}

function clearUnlock(el: HTMLElement) {
  for (const [property] of UNLOCK_STYLES) {
    el.style.removeProperty(property);
  }
  el.style.removeProperty('--removed-body-scroll-bar-size');
}

/** استایل اینلاین تا از stylesheet تزریقی RemoveScroll قوی‌تر باشد. */
export function refreshKeepPageScroll() {
  if (lockCount === 0 || hasBlockingDialog()) return;
  applyUnlock(document.documentElement);
  applyUnlock(document.body);
}

export function acquireKeepPageScroll() {
  lockCount += 1;
  refreshKeepPageScroll();
}

export function releaseKeepPageScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  clearUnlock(document.documentElement);
  clearUnlock(document.body);
}

export function resetKeepPageScrollForTests() {
  lockCount = 0;
  if (typeof document === 'undefined') return;
  clearUnlock(document.documentElement);
  clearUnlock(document.body);
}
