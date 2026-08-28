import { useEffect, useState, type ReactNode } from 'react';

import { kvTabsBodyBorderClassName } from '@/components/shared/shell/shellChrome';
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
 * Border + equal vertical padding sit on the content below tabs (not under the tab track).
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

  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shouldRenderDesktop = isDesktop === null || isDesktop === true;
  const shouldRenderMobile = isDesktop === null || isDesktop === false;

  return (
    <div
      className={cn('flex flex-col gap-kv-group', className)}
      dir="rtl"
      data-slot="kv-split-workspace"
    >
      {tabs ? <div data-slot="kv-split-workspace-tabs">{tabs}</div> : null}
      <div
        className={cn(
          'space-y-kv-group',
          tabs && cn(kvTabsBodyBorderClassName, 'py-kv-group')
        )}
        data-slot="kv-split-workspace-body"
      >
        {toolbar}

        {showDesktop && shouldRenderDesktop ? (
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
                widths.secondary
              )}
              data-slot="kv-split-workspace-secondary"
            >
              {secondary}
            </section>
          </div>
        ) : null}

        {showMobile && shouldRenderMobile ? (
          <div className="block lg:hidden" data-slot="kv-split-workspace-mobile">
            {mobileContent}
          </div>
        ) : null}
      </div>
    </div>
  );
}
