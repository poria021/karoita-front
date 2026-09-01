import { cn } from '@/lib/utils';

export function KvRouteStatusFrame({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn(
        'pointer-events-none absolute inset-0 size-full text-kv-border-strong',
        className
      )}
      aria-hidden
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
        opacity="0.75"
      >
        <path d="M0 16V0h16" />
        <path d="M84 0h16v16" />
        <path d="M100 84v16H84" />
        <path d="M16 100H0V84" />
      </g>
      <g
        fill="none"
        stroke="var(--kv-brand)"
        strokeWidth="0.9"
        strokeDasharray="2 4"
        vectorEffect="non-scaling-stroke"
        opacity="0.3"
      >
        <rect x="7" y="7" width="86" height="86" rx="2" />
      </g>
    </svg>
  );
}
