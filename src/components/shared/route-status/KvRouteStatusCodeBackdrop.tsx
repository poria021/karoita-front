import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';

type KvRouteStatusCodeBackdropProps = {
  code: string;
  layout?: 'page' | 'inset';
  className?: string;
};

/** کد وضعیت محو در پس‌زمینه — در `inset` به پنل `main` اندازه می‌شود نه ویوپورت. */
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
