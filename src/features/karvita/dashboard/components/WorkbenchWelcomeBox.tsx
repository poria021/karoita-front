'use client';

import type { CSSProperties } from 'react';

import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { cn } from '@/lib/utils';

export type WorkbenchWelcomeBoxProps = {
  /** نام نمایشی کاربر — در تیتر «{نام} خوش آمدید». */
  displayName: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * باکس خوش‌آمد مشترک همهٔ پنل‌های میز کار: فقط تیتر «{نام} خوش آمدید» و
 * نشان کارویتا. ارتفاع از گرید ثابت (۱۱۲px) است.
 */
export function WorkbenchWelcomeBox({
  displayName,
  className,
  style,
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

      <div className="relative z-[1] flex min-h-0 flex-1 items-center p-kv-group">
        <h3
          id="dashboard-welcome-title"
          className="kv-welcome-enter line-clamp-1 min-w-0 text-lg font-black leading-snug tracking-tight text-kv-text sm:text-xl"
        >
          {displayName} خوش آمدید
        </h3>
      </div>
    </section>
  );
}
