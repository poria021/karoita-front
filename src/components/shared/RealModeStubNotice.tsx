'use client';

import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { isRealApiMode, REAL_MODE_NOT_IMPLEMENTED } from '@/lib/api-mode';

/** فعال در هر real mode (dev یا production) — این عملیات هنوز به API واقعی وصل نشده و هیچ داده‌ی نمایشی جایگزین آن نمی‌شود. */
export const IS_REAL_MODE_STUB_ACTIVE = isRealApiMode();

/** دکمه/فیلد stub را با یک tooltip توضیح‌دهنده می‌پوشاند؛ فقط در real mode فعال است. */
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

/** بج کوچک برای نشان‌دادن این‌که یک بخش هنوز به API واقعی وصل نیست (real mode). */
export function RealModeStubBadge({ className }: { className?: string }) {
  if (!IS_REAL_MODE_STUB_ACTIVE) return null;

  return (
    <Badge variant="warning" className={className}>
      وصل‌نشده به API
    </Badge>
  );
}
