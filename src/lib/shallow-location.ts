/**
 * به‌روزرسانی query روی همان مسیر بدون ناوبری App Router.
 * `router.replace(?tab=)` سند کامل و `loading.tsx` را می‌آورد؛ SPA باید
 * `history.replaceState` بزند و پوسته را نگه دارد.
 */

const listeners = new Set<() => void>();

let installed = false;
let originalPushState: History['pushState'] | null = null;
let originalReplaceState: History['replaceState'] | null = null;

function emit(): void {
  for (const listener of listeners) listener();
}

function installHistoryBridge(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  originalPushState = window.history.pushState.bind(window.history);
  originalReplaceState = window.history.replaceState.bind(window.history);
  window.history.pushState = function patchedPushState(
    ...args: Parameters<History['pushState']>
  ) {
    originalPushState!(...args);
    emit();
  };
  window.history.replaceState = function patchedReplaceState(
    ...args: Parameters<History['replaceState']>
  ) {
    originalReplaceState!(...args);
    emit();
  };
  window.addEventListener('popstate', emit);
}

export function subscribeShallowLocation(listener: () => void): () => void {
  installHistoryBridge();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getShallowLocationSearch(): string {
  return window.location.search;
}

export function getShallowLocationSearchServerSnapshot(): string {
  return '';
}

/** `href` نسبی یا همان‌مسیر+query؛ state روتر نکست را نگه می‌دارد. */
export function replaceShallowHref(href: string): void {
  if (typeof window === 'undefined') return;
  const url = new URL(href, window.location.href);
  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next === current) return;
  window.history.replaceState(window.history.state, '', next);
}

export function resetShallowLocationForTests(): void {
  listeners.clear();
  if (typeof window === 'undefined' || !installed) return;
  if (originalPushState) {
    window.history.pushState = originalPushState;
  }
  if (originalReplaceState) {
    window.history.replaceState = originalReplaceState;
  }
  window.removeEventListener('popstate', emit);
  originalPushState = null;
  originalReplaceState = null;
  installed = false;
}
