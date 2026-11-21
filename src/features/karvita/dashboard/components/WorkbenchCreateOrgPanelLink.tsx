'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';
import { RouteService } from '@/services/route.service';

export type WorkbenchCreateOrgPanelLinkProps = {
  className?: string;
  style?: CSSProperties;
};

/** پلکان تزئینی (سمت چپِ کارت) — تناژ یک‌رنگ برند: هرچه بالاتر، پررنگ‌تر. */
const STAIRS: { x: number; y: number }[] = [
  { x: 0, y: 60 },
  { x: 20, y: 60 },
  { x: 20, y: 40 },
  { x: 40, y: 60 },
  { x: 40, y: 40 },
  { x: 40, y: 20 },
  { x: 60, y: 60 },
  { x: 60, y: 40 },
];

function stairFill(y: number): { fill: string; opacity: number } {
  if (y <= 20) return { fill: 'var(--kv-brand-active)', opacity: 0.9 };
  if (y <= 40) return { fill: 'var(--kv-brand)', opacity: 0.6 };
  return { fill: 'var(--kv-brand)', opacity: 0.28 };
}

function StairsArt() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 80 80"
      className="pointer-events-none absolute bottom-0 end-3 h-full max-h-[5.5rem] w-auto"
      preserveAspectRatio="xMaxYMax meet"
    >
      {/* آینه‌ای افقی نسبت به طرح اولیه. */}
      <g transform="translate(80 0) scale(-1 1)">
        {STAIRS.map(({ x, y }) => {
          const tone = stairFill(y);
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="16"
              height="16"
              rx="4"
              fill={tone.fill}
              opacity={tone.opacity}
            />
          );
        })}
      </g>
    </svg>
  );
}

/**
 * کارت تبلیغی کوچک زیر آمار نقش‌ها: هدایت به صفحهٔ ساخت حساب (نقش سازمانی).
 * عنوان، توضیح کوتاه، لینک با فلش و تصویر تزئینی. فقط مدیر ارشد؛ بدون API.
 */
export function WorkbenchCreateOrgPanelLink({
  className,
  style,
}: WorkbenchCreateOrgPanelLinkProps) {
  return (
    <Link
      href={RouteService.karvita.adminUserCreation()}
      prefetch
      style={style}
      className={cn(
        'group relative flex min-h-[7rem] min-w-0 flex-col items-start justify-center gap-1.5 overflow-hidden rounded-kv-shell border border-kv-border/70 bg-kv-surface py-kv-group ps-kv-group pe-28 shadow-kv-soft',
        'transition-colors duration-200 can-hover:hover:bg-kv-surface-muted/40',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
        className
      )}
    >
      <span
        dir="rtl"
        className="w-full text-end text-sm font-bold leading-snug text-kv-text"
      >
        ساخت پنل سازمانی
      </span>
      <span
        dir="rtl"
        className="w-full text-end text-[11px] font-medium leading-relaxed text-kv-text-muted"
      >
        حساب مدیر منطقه، دانشکده یا دانشگاه استانی را بسازید.
      </span>
      <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-kv-brand">
        <span dir="rtl">ساخت حساب</span>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="size-3.5 transition-transform duration-200 can-hover:group-hover:-translate-x-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 3 5 8l5 5" />
        </svg>
      </span>
      <StairsArt />
    </Link>
  );
}
