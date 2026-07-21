import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

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
  tabs?: ReactNode;
  toolbar?: ReactNode;
  primary: ReactNode;
  secondary: ReactNode;
  mobile?: ReactNode;
  ratio?: KvSplitWorkspaceRatio;
  className?: string;
};

/**
 * ورک‌اسپیس دو ستونه (دسکتاپ) + اسلات موبایل — فقط لایوت، بدون منطق دامنه.
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
      <div
        className="space-y-kv-section border-t border-kv-border-muted pt-kv-section"
        data-slot="kv-split-workspace-body"
      >
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
    </div>
  );
}
