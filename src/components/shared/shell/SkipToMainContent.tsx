'use client';

import { shellCopy } from '@/components/shared/shell/shellCopy';

export const DASHBOARD_MAIN_ID = 'karvita-main-content';
export const SKIP_TO_MAIN_ID = 'karvita-skip-to-main';

/**
 * First focusable control in the dashboard shell — jumps keyboard users past
 * header/sidebar chrome into the module main landmark (WCAG 2.4.1).
 */
export function SkipToMainContent() {
  return (
    <a
      id={SKIP_TO_MAIN_ID}
      href={`#${DASHBOARD_MAIN_ID}`}
      onClick={(event) => {
        const target = document.getElementById(DASHBOARD_MAIN_ID);
        if (!target) return;
        event.preventDefault();
        target.focus({ preventScroll: false });
        target.scrollIntoView({ block: 'start' });
      }}
      className={[
        'sr-only',
        'focus:not-sr-only focus:fixed focus:start-kv-group focus:top-kv-group focus:z-[100]',
        'focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-kv-control',
        'focus:border focus:border-kv-brand focus:bg-kv-surface focus:px-kv-inline focus:py-kv-pair',
        'focus:text-sm focus:font-bold focus:text-kv-text focus:shadow-kv-overlay',
        'focus:outline-none focus:ring-[3px] focus:ring-kv-ring/20',
      ].join(' ')}
    >
      {shellCopy.a11y.skipToMain}
    </a>
  );
}
