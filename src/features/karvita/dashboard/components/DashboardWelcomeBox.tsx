'use client';

import type { ReactNode } from 'react';

import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

type DashboardWelcomeBoxProps = {
  displayName: string;
  /** استان / دانشکده کاربر — زیر خوش‌آمد. */
  orgLine?: string | null;
  className?: string;
  /** اسلات محتوای پایین (ترم، وضعیت، …). */
  children?: ReactNode;
};

/**
 * باکس خوش‌آمد میز کار — «{نام} خوش آمدید» و در صورت نیاز orgLine / children.
 */
export function DashboardWelcomeBox({
  displayName,
  orgLine,
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
        className="kv-welcome-mark pointer-events-none absolute -end-1 -top-1 size-24 text-kv-brand opacity-[0.08] sm:size-28"
      />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col gap-kv-pair p-kv-group">
        <header className="kv-welcome-enter shrink-0">
          <h3
            id="dashboard-welcome-title"
            className="line-clamp-2 text-lg font-black leading-snug tracking-tight text-kv-text sm:text-xl"
          >
            {displayName} خوش آمدید
          </h3>
          {orgLine ? (
            <KvTypography
              variant="caption"
              tone="muted"
              as="p"
              className="mt-1 line-clamp-1 text-xs font-medium sm:text-sm"
            >
              {orgLine}
            </KvTypography>
          ) : null}
        </header>

        {children ? (
          <div className="kv-welcome-enter-delay flex min-h-0 flex-1 flex-col gap-kv-pair overflow-y-auto">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
