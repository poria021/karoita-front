import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';

type KvRouteStatusCodeBackdropProps = {
  code: string;
  /** Full-page gets a larger, more atmospheric code. */
  layout?: 'page' | 'inset';
  className?: string;
};

/**
 * Large faded status code as a background section (not a badge).
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
          'font-sans font-black leading-none tracking-tight text-kv-border',
          layout === 'page'
            ? 'text-[min(42vw,18rem)] opacity-[0.14] sm:text-[min(36vw,20rem)]'
            : 'text-[min(48vw,10rem)] opacity-[0.12]'
        )}
      >
        {toPersianDigits(code)}
      </span>
    </div>
  );
}
