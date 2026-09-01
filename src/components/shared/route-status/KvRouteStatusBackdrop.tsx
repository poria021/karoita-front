import { cn } from '@/lib/utils';

export function KvRouteStatusBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className
      )}
      aria-hidden
    >
      <svg
        className="absolute inset-0 size-full opacity-[0.62]"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="kvRsGrid"
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M36 0H0V36"
              stroke="var(--kv-border)"
              strokeWidth="1"
              opacity="0.45"
            />
          </pattern>
          <radialGradient id="kvRsFade" cx="50%" cy="40%" r="58%">
            <stop offset="0%" stopColor="var(--kv-brand-soft)" stopOpacity="0.75" />
            <stop offset="60%" stopColor="var(--kv-canvas)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--kv-canvas)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1200" height="800" fill="url(#kvRsGrid)" />

        <circle
          cx="160"
          cy="120"
          r="130"
          stroke="var(--kv-brand)"
          strokeWidth="1"
          strokeDasharray="3 10"
          opacity="0.2"
        />
        <circle
          cx="1080"
          cy="660"
          r="170"
          stroke="var(--kv-info)"
          strokeWidth="1"
          strokeDasharray="2 12"
          opacity="0.18"
        />
        <circle
          cx="600"
          cy="400"
          r="220"
          stroke="var(--kv-border-strong)"
          strokeWidth="1"
          strokeDasharray="1 14"
          opacity="0.14"
        />

        <path
          d="M40 740 C280 520, 920 720, 1160 80"
          stroke="var(--kv-border-strong)"
          strokeWidth="1"
          strokeDasharray="5 12"
          opacity="0.22"
        />
        <path
          d="M80 40 C400 180, 800 40, 1120 200"
          stroke="var(--kv-brand)"
          strokeWidth="1"
          strokeDasharray="2 10"
          opacity="0.14"
        />

        <g stroke="var(--kv-brand)" strokeWidth="1.2" opacity="0.28">
          <path d="M100 64h24M112 52v24" />
          <path d="M1050 710h24M1062 698v24" />
          <path d="M960 90h18M969 81v18" />
          <path d="M200 680h16M208 672v16" />
        </g>

        <g
          stroke="var(--kv-info)"
          strokeWidth="1.1"
          opacity="0.22"
          fill="none"
        >
          <rect x="860" y="140" width="28" height="28" rx="2" />
          <path d="M140 520l18 18M158 520l-18 18" />
          <circle cx="980" cy="280" r="8" />
        </g>
      </svg>
    </div>
  );
}
