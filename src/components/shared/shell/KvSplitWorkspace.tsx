import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Desktop primary/secondary width pair (twelfths). Default matches onboarding. */
export type KvSplitWorkspaceRatio = '5/7' | '6/6' | '4/8';

const RATIO_CLASS: Record<
  KvSplitWorkspaceRatio,
  { primary: string; secondary: string }
> = {
  '5/7': { primary: 'lg:w-5/12', secondary: 'lg:w-7/12' },
  '6/6': { primary: 'lg:w-6/12', secondary: 'lg:w-6/12' },
  '4/8': { primary: 'lg:w-4/12', secondary: 'lg:w-8/12' },
};

export type KvSplitWorkspaceProps = {
  /** Module sub-nav (tabs, segment control, …). */
  tabs?: ReactNode;
  /**
   * Full-width chrome between tabs and columns (e.g. mobile-only filter strip).
   * Column-scoped filters belong inside `primary` / `mobile`, not here.
   */
  toolbar?: ReactNode;
  /** List/table column — visible from `lg` up. Pass `null` to omit. */
  primary: ReactNode;
  /** Detail column — visible from `lg` up. Pass `null` to omit. */
  secondary: ReactNode;
  /**
   * Below `lg`: accordion/card UI.
   * Omitted → fall back to `primary`. Pass `null` to hide mobile entirely.
   */
  mobile?: ReactNode;
  /** @default '5/7' → primary `lg:w-5/12`, secondary `lg:w-7/12` */
  ratio?: KvSplitWorkspaceRatio;
  className?: string;
};

/**
 * Two-column module workspace (desktop) + mobile slot.
 * Layout only — no tables, filters, or domain actions.
 * Secondary (detail) cards use `rounded-kv-card` so the companion pane
 * reads rounder than the table panel.
 */
export function KvSplitWorkspace({
  tabs,
  toolbar,
  primary,
  secondary,
  mobile,
  ratio = '5/7',
  className,
}: KvSplitWorkspaceProps) {
  const widths = RATIO_CLASS[ratio];
  const mobileContent = mobile !== undefined ? mobile : primary;
  const showDesktop = primary != null || secondary != null;
  const showMobile = mobileContent != null;

  return (
    <div
      className={cn('space-y-kv-section', className)}
      dir="rtl"
      data-slot="kv-split-workspace"
    >
      {tabs}
      {toolbar}

      {showDesktop ? (
        <div
          className="hidden w-full flex-row items-stretch gap-kv-section lg:flex"
          data-slot="kv-split-workspace-desktop"
        >
          <section
            className={cn(
              'flex w-full flex-col gap-kv-group text-start',
              widths.primary
            )}
            data-slot="kv-split-workspace-primary"
          >
            {primary}
          </section>
          <section
            className={cn(
              'flex w-full min-h-0 flex-col',
              /* Detail companion: rounder than table panel (kv-card vs kv-panel). */
              '[&_[data-slot=kv-card]]:rounded-kv-card',
              widths.secondary
            )}
            data-slot="kv-split-workspace-secondary"
          >
            {secondary}
          </section>
        </div>
      ) : null}

      {showMobile ? (
        <div className="block lg:hidden" data-slot="kv-split-workspace-mobile">
          {mobileContent}
        </div>
      ) : null}
    </div>
  );
}
