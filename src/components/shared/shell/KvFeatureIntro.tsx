import type { ReactNode } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

export type KvFeatureIntroProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function KvFeatureIntro({
  title,
  description,
  actions,
  className,
}: KvFeatureIntroProps) {
  return (
    <div
      data-slot="kv-feature-intro"
      className={cn(
        'flex flex-col items-stretch justify-between gap-kv-group lg:flex-row lg:items-start',
        className
      )}
    >
      <div className="min-w-0 space-y-kv-micro text-start">
        <KvTypography variant="subtitle" weight="bold" as="h2">
          {title}
        </KvTypography>
        {description ? (
          <KvTypography variant="caption" tone="muted" as="p">
            {description}
          </KvTypography>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-col items-stretch gap-kv-pair lg:w-auto lg:flex-row lg:items-center">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
