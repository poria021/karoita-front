'use client';

import type { ReactNode } from 'react';

import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvRouteStatusArt } from '@/components/shared/route-status/KvRouteStatusArt';
import { KvRouteStatusBackdrop } from '@/components/shared/route-status/KvRouteStatusBackdrop';
import { KvRouteStatusCodeBackdrop } from '@/components/shared/route-status/KvRouteStatusCodeBackdrop';
import { KvRouteStatusFrame } from '@/components/shared/route-status/KvRouteStatusFrame';
import type { KvRouteStatusKind } from '@/components/shared/route-status/kinds';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';

export type { KvRouteStatusKind };

export type KvRouteStatusProps = {
  kind: KvRouteStatusKind;
  title: string;
  description: string;
  /** Quiet secondary guidance under the description. */
  hint?: string;
  actions?: ReactNode;
  /** `page` = full viewport open canvas; `inset` = inside dashboard shell. */
  layout?: 'page' | 'inset';
  className?: string;
};

const KIND_META: Record<
  KvRouteStatusKind,
  {
    code: string;
    role: 'alert' | 'status';
    glowClass: string;
  }
> = {
  error: {
    code: '500',
    role: 'alert',
    glowClass: 'bg-kv-danger-soft/50',
  },
  notFound: {
    code: '404',
    role: 'status',
    glowClass: 'bg-kv-brand-soft/50',
  },
  forbidden: {
    code: '403',
    role: 'status',
    glowClass: 'bg-kv-warning-soft/50',
  },
  unauthorized: {
    code: '401',
    role: 'status',
    glowClass: 'bg-kv-info-soft/50',
  },
};

/**
 * Route status — open canvas, huge faded code section,
 * ready Font Awesome vectors in a framed stage.
 */
export function KvRouteStatus({
  kind,
  title,
  description,
  hint,
  actions,
  layout = 'page',
  className,
}: KvRouteStatusProps) {
  const meta = KIND_META[kind];
  const isPage = layout === 'page';

  return (
    <div
      data-slot="kv-route-status"
      data-kind={kind}
      className={cn(
        'relative flex w-full flex-col items-center justify-center px-kv-inset',
        isPage ? 'min-h-dvh overflow-hidden py-kv-layout' : 'min-h-[50vh] py-kv-block',
        className
      )}
      dir="rtl"
      role={meta.role}
    >
      {/* Background sections */}
      {isPage ? <KvRouteStatusBackdrop /> : null}
      <KvRouteStatusCodeBackdrop code={meta.code} layout={layout} />

      {/* Foreground content */}
      <div
        className={cn(
          'kv-auth-enter relative z-[1] flex w-full max-w-lg flex-col items-center text-center',
          isPage ? 'gap-kv-section' : 'gap-kv-stack'
        )}
      >
        {isPage ? (
          <div className="relative z-[1] flex items-center gap-kv-inline">
            <KarvitaBrandMark className="size-8 sm:size-9" />
            <div className="flex flex-col items-start gap-kv-micro">
              <KvTypography variant="overline" tone="brand" as="span" weight="bold">
                کارویتا
              </KvTypography>
              <KvTypography variant="caption" tone="muted" as="span">
                سامانه کارآموزی
              </KvTypography>
            </div>
          </div>
        ) : null}

        <div className="relative z-[1] w-full max-w-[280px] sm:max-w-[300px]">
          <div
            className={cn(
              'pointer-events-none absolute inset-[10%] rounded-full blur-2xl',
              meta.glowClass
            )}
            aria-hidden
          />
          <div className="relative flex w-full items-center justify-center p-kv-pair">
            <KvRouteStatusFrame />
            <KvRouteStatusArt kind={kind} className="relative z-[1]" />
          </div>
        </div>

        <div className="relative z-[1] flex max-w-md flex-col items-center gap-kv-group">
          <div className="flex flex-col items-center gap-kv-pair">
            <KvTypography variant="overline" tone="muted" as="p">
              کد وضعیت {toPersianDigits(meta.code)}
            </KvTypography>
            <KvTypography variant="title" as="h1" weight="black">
              {title}
            </KvTypography>
            <KvTypography variant="body" tone="muted" as="p">
              {description}
            </KvTypography>
          </div>

          {hint ? (
            <KvTypography variant="caption" tone="muted" as="p">
              {hint}
            </KvTypography>
          ) : null}

          {actions ? (
            <div className="flex flex-wrap items-center justify-center gap-kv-inline pt-kv-pair">
              {actions}
            </div>
          ) : null}
        </div>

        {isPage ? (
          <div
            className="relative z-[1] flex w-full max-w-sm items-center gap-kv-inline"
            aria-hidden
          >
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-kv-border" />
            <KvTypography variant="overline" tone="muted" as="span">
              کارویتا
            </KvTypography>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-kv-border" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
