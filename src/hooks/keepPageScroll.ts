const GUTTER_UNLOCK: Array<[string, string]> = [
  ['margin-right', '0px'],
  ['margin-left', '0px'],
  ['padding-right', '0px'],
  ['padding-left', '0px'],
  ['overscroll-behavior', 'auto'],
];

/** اسکرول سند روی html بماند تا sticky هدر/سایدبار به viewport بچسبد. */
const HTML_UNLOCK_STYLES: Array<[string, string]> = [
  ['overflow', 'auto'],
  ['overflow-x', 'visible'],
  ['overflow-y', 'auto'],
  ...GUTTER_UNLOCK,
];

/**
 * overflow غیر visible روی body ظرف اسکرول جدا می‌سازد و sticky را به بالای سند
 * می‌فرستد. قفل RemoveScroll را با visible خنثی می‌کنیم، نه auto.
 */
const BODY_UNLOCK_STYLES: Array<[string, string]> = [
  ['overflow', 'visible'],
  ['overflow-x', 'visible'],
  ['overflow-y', 'visible'],
  ...GUTTER_UNLOCK,
];

let lockCount = 0;

function hasBlockingDialog(): boolean {
  return Boolean(
    document.querySelector(
      '[data-slot="dialog-overlay"], [data-slot="alert-dialog-overlay"]'
    )
  );
}

function applyUnlock(el: HTMLElement, styles: Array<[string, string]>) {
  for (const [property, value] of styles) {
    el.style.setProperty(property, value, 'important');
  }
  el.style.setProperty('--removed-body-scroll-bar-size', '0px');
}

function clearUnlock(el: HTMLElement, styles: Array<[string, string]>) {
  for (const [property] of styles) {
    el.style.removeProperty(property);
  }
  el.style.removeProperty('--removed-body-scroll-bar-size');
}

/** استایل اینلاین تا از stylesheet تزریقی RemoveScroll قوی‌تر باشد. */
export function refreshKeepPageScroll() {
  if (lockCount === 0 || hasBlockingDialog()) return;
  applyUnlock(document.documentElement, HTML_UNLOCK_STYLES);
  applyUnlock(document.body, BODY_UNLOCK_STYLES);
}

export function acquireKeepPageScroll() {
  lockCount += 1;
  refreshKeepPageScroll();
}

export function releaseKeepPageScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  clearUnlock(document.documentElement, HTML_UNLOCK_STYLES);
  clearUnlock(document.body, BODY_UNLOCK_STYLES);
}

export function resetKeepPageScrollForTests() {
  lockCount = 0;
  if (typeof document === 'undefined') return;
  clearUnlock(document.documentElement, HTML_UNLOCK_STYLES);
  clearUnlock(document.body, BODY_UNLOCK_STYLES);
}
