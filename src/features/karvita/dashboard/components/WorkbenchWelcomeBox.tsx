'use client';

import type { CSSProperties, ReactNode } from 'react';

import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

export type WorkbenchWelcomeBoxProps = {
  /** نام نمایشی کاربر — در تیتر «{نام} خوش آمدید». */
  displayName: string;
  /** استان / دانشکده — زیر خوش‌آمد. */
  orgLine?: string | null;
  className?: string;
  style?: CSSProperties;
  /** اسلات محتوای پایین (ترم، وضعیت، …). */
  children?: ReactNode;
};

/**
 * باکس خوش‌آمد مشترک همهٔ صفحات میز کار.
 */
export function WorkbenchWelcomeBox({
  displayName,
  orgLine,
  className,
  style,
  children,
}: WorkbenchWelcomeBoxProps) {
  return (
    <section
      aria-labelledby="dashboard-welcome-title"
      style={style}
      className={cn(
        'kv-welcome-panel relative flex h-full min-h-0 flex-col overflow-hidden rounded-kv-panel border border-kv-border/70 bg-kv-surface shadow-kv-raised',
        className
      )}
    >
      <div aria-hidden className="kv-welcome-wash pointer-events-none absolute inset-0" />
      <KarvitaBrandMark
        className="kv-welcome-mark pointer-events-none absolute -end-1 -top-1 size-24 sm:size-28"
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
