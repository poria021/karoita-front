'use client';

import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  isRealApiMode,
  isStrictRealApiMode,
  REAL_MODE_NOT_IMPLEMENTED,
} from '@/lib/api-mode';

/**
 * فقط در real mode + production (fail-closed واقعی) فعاله — یعنی این عملیات نه
 * پیاده شده نه جایگزین mock داره. تو real mode محلی (dev) این false است چون
 * همان‌جا از mock به‌عنوان fallback استفاده می‌شود.
 */
export const IS_REAL_MODE_STUB_ACTIVE = isStrictRealApiMode();

/** true وقتی این صفحه در real mode محلی (dev) از داده‌ی mock fallback به‌جای API واقعی استفاده می‌کند. */
export const IS_DEMO_FALLBACK_ACTIVE = isRealApiMode() && !isStrictRealApiMode();

/** دکمه/فیلد stub را با یک tooltip توضیح‌دهنده می‌پوشاند؛ فقط در real mode + production فعال است. */
export function RealModeStubTooltip({
  children,
  message = REAL_MODE_NOT_IMPLEMENTED,
}: {
  children: ReactNode;
  message?: string;
}) {
  if (!IS_REAL_MODE_STUB_ACTIVE) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex" tabIndex={0}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{message}</TooltipContent>
    </Tooltip>
  );
}

/** بج کوچک برای نشان‌دادن این‌که یک بخش هنوز به API واقعی وصل نیست (real mode + production). */
export function RealModeStubBadge({ className }: { className?: string }) {
  if (!IS_REAL_MODE_STUB_ACTIVE) return null;

  return (
    <Badge variant="warning" className={className}>
      وصل‌نشده به API
    </Badge>
  );
}

/** بج کوچک برای نشان‌دادن این‌که این محتوا در real mode محلی از داده‌ی mock fallback می‌آید، نه API واقعی. */
export function DemoDataBadge({ className }: { className?: string }) {
  if (!IS_DEMO_FALLBACK_ACTIVE) return null;

  return (
    <Badge variant="info" className={className}>
      داده نمایشی
    </Badge>
  );
}
