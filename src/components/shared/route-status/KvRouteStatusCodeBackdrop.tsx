import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';

type KvRouteStatusCodeBackdropProps = {
  code: string;
  /** Full-page vs in-shell main content sizing. */
  layout?: 'page' | 'inset';
  className?: string;
};

/**
 * Large faded status code as a background section (not a badge).
 * Inset mode sizes to the dashboard main panel, not the viewport.
 */
export function KvRouteStatusCodeBackdrop({
  code,
  layout = 'page',
  className,
}: KvRouteStatusCodeBackdropProps) {
  return (
    <div
      data-slot="kv-route-status-code"
      className={cn(
        'pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden',
        className
      )}
      aria-hidden
    >
      <span
        className={cn(
          'font-sans font-black leading-none tracking-tight text-kv-text-faint',
          layout === 'page'
            ? 'text-[min(42vw,18rem)] opacity-3 sm:text-[min(36vw,20rem)]'
            : 'text-[clamp(4.5rem,30cqw,900rem)] opacity-3'
        )}
      >
        {toPersianDigits(code)}
      </span>
    </div>
  );
}
