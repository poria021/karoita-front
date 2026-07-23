'use client';

import { shellCopy } from '@/components/shared/shell/shellCopy';

export const DASHBOARD_MAIN_ID = 'karvita-main-content';

/**
 * First focusable control in the dashboard shell — jumps keyboard users past
 * header/sidebar chrome into the module main landmark (WCAG 2.4.1).
 */
export function SkipToMainContent() {
  return (
    <a
      href={`#${DASHBOARD_MAIN_ID}`}
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
