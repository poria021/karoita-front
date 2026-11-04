'use client';

import type { ReactNode } from 'react';

import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

type DashboardWelcomeBoxProps = {
  displayName: string;
  /** توضیح کوتاه پنل — موقتاً؛ جای اطلاعات ترم و وضعیت. */
  subtitle: string;
  className?: string;
  /** اسلات محتوای پایین (ترم، وضعیت، …). اگر نباشد همان subtitle نمایش داده می‌شود. */
  children?: ReactNode;
};

/**
 * باکس خوش‌آمد میز کار — بالا: «{نام} خوش آمدید»؛ پایین: اطلاعات ترم و وضعیت.
 */
export function DashboardWelcomeBox({
  displayName,
  subtitle,
  className,
  children,
}: DashboardWelcomeBoxProps) {
  return (
    <section
      aria-labelledby="dashboard-welcome-title"
      className={cn(
        'kv-welcome-panel relative flex h-full min-h-0 flex-col overflow-hidden rounded-kv-panel border border-kv-brand-border/70 bg-kv-surface shadow-kv-raised',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,var(--color-kv-brand-soft)_0%,transparent_42%,var(--color-kv-surface)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -start-8 -top-10 size-36 rounded-full bg-kv-brand/[0.07] blur-2xl"
      />
      <KarvitaBrandMark
        className="kv-welcome-mark pointer-events-none absolute -end-1 top-3 size-24 text-kv-brand opacity-[0.08] sm:size-28"
      />
      <span
        aria-hidden
        className="absolute inset-y-3 start-0 w-1 rounded-e-kv-tight bg-kv-brand"
      />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col gap-kv-group px-kv-group py-kv-group ps-[1.15rem]">
        <header className="kv-welcome-enter shrink-0">
          <h3
            id="dashboard-welcome-title"
            className="line-clamp-2 text-lg font-black leading-snug tracking-tight text-kv-text sm:text-xl"
          >
            {displayName} خوش آمدید
          </h3>
          <span
            aria-hidden
            className="mt-2 block h-0.5 w-10 rounded-full bg-kv-brand"
          />
        </header>

        <div className="kv-welcome-enter-delay flex min-h-0 flex-1 flex-col gap-kv-pair overflow-y-auto">
          {children ?? (
            <KvTypography
              variant="body"
              tone="muted"
              as="p"
              className="line-clamp-3 text-xs leading-relaxed sm:text-sm"
            >
              {subtitle}
            </KvTypography>
          )}
        </div>
      </div>
    </section>
  );
}
