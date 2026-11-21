'use client';

import { useId, type ReactNode } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';

export type DonutSegment = {
  id: string;
  label: string;
  value: number;
  color: string;
};

export type StatusDonutProps = {
  segments: readonly DonutSegment[];
  /** عدد وسط حلقه؛ اگر `centerValue` نباشد، همین نمایش داده می‌شود. */
  total?: number;
  /** جایگزین عدد وسط (مثلاً «۳/۱۲»). */
  centerValue?: ReactNode;
  /** برچسب زیر عدد وسط. */
  centerLabel?: string;
  activeId?: string | null;
  onHover?: (id: string | null) => void;
  /** کوچک‌تر برای استفاده‌ی چندتایی (هر درس یک حلقه). */
  compact?: boolean;
  className?: string;
};

/**
 * نمودار حلقه‌ای مشترک میز کار — همان نمودار باکس «وضعیت پرونده‌ها».
 */
export function StatusDonut({
  segments,
  total = 0,
  centerValue,
  centerLabel = 'پرونده',
  activeId = null,
  onHover,
  compact = false,
  className,
}: StatusDonutProps) {
  const gradientNs = useId().replace(/:/g, '');
  const chartData = segments.filter((segment) => segment.value > 0);
  const hasValues = chartData.length > 0;

  return (
    <div
      className={cn(
        'relative shrink-0',
        compact
          ? 'size-[3.75rem]'
          : 'size-[11rem] md:size-[10rem] lg:size-[13rem] xl:size-[14.5rem]',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[16%] rounded-full bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklab,var(--kv-brand)_9%,transparent),transparent_72%)]"
      />

      <div dir="ltr" className="size-full">
        {hasValues ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {chartData.map((segment) => (
                  <linearGradient
                    key={segment.id}
                    id={`${gradientNs}-${segment.id}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={segment.color}
                      stopOpacity={1}
                    />
                    <stop
                      offset="100%"
                      stopColor={segment.color}
                      stopOpacity={0.78}
                    />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="64%"
                outerRadius="78%"
                paddingAngle={0}
                cornerRadius={0}
                stroke="none"
                strokeWidth={0}
                isAnimationActive
                animationDuration={700}
                animationEasing="ease-out"
                onMouseLeave={() => onHover?.(null)}
              >
                {chartData.map((segment) => {
                  const dimmed = activeId != null && activeId !== segment.id;
                  return (
                    <Cell
                      key={segment.id}
                      fill={`url(#${gradientNs}-${segment.id})`}
                      fillOpacity={dimmed ? 0.28 : 1}
                      style={{
                        cursor: onHover ? 'pointer' : 'default',
                        transition: 'fill-opacity 220ms ease',
                        filter: dimmed
                          ? undefined
                          : 'drop-shadow(0 4px 10px color-mix(in oklab, var(--kv-text) 10%, transparent))',
                      }}
                      onMouseEnter={() => onHover?.(segment.id)}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex size-full items-center justify-center">
            <div className="size-[70%] rounded-full border-[8px] border-kv-surface-muted sm:border-[9px] lg:border-[10px]" />
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={cn(
            'font-sans font-black leading-none tracking-tight text-kv-text tabular-nums',
            compact
              ? 'text-[11px]'
              : 'text-[1.5rem] sm:text-[1.75rem] lg:text-[2rem]'
          )}
        >
          {centerValue ?? toPersianDigits(total)}
        </span>
        {centerLabel ? (
          <span
            className={cn(
              'font-bold text-kv-text-muted',
              compact
                ? 'mt-0.5 text-[10px]'
                : 'mt-1 text-[10px] sm:mt-1.5 sm:text-[11px]'
            )}
          >
            {centerLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
