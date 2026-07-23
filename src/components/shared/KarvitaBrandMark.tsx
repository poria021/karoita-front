import { cn } from '@/lib/utils';

interface KarvitaBrandMarkProps {
  className?: string;
}

/** Official Karvita mark — brand solid + inverse stroke (auth + marketing). */
export function KarvitaBrandMark({ className }: KarvitaBrandMarkProps) {
  return (
    <svg
      className={cn(
        'h-11 w-auto shrink-0 rounded-kv-control shadow-kv-raised sm:h-12',
        className
      )}
      viewBox="0 0 45 45"
      fill="none"
      aria-hidden="true"
    >
      <rect width="45" height="45" rx="12" className="fill-kv-brand" />
      <path
        d="M14 12V33M14 22.5L28 12M20.5 22.5L28.5 33"
        className="stroke-kv-text-inverse"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
