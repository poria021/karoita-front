import { cn } from '@/lib/utils';

interface KarvitaBrandMarkProps {
  className?: string;
}

/** فقط خود مارک، با رنگ برند؛ بدون باکس؛ رنگ برند در هر دو تم. */
export function KarvitaBrandMark({ className }: KarvitaBrandMarkProps) {
  return (
    <span
      role="img"
      aria-hidden="true"
      className={cn(
        'kv-brand-mark aspect-[281/223] size-8 text-kv-brand sm:size-9',
        className
      )}
    />
  );
}
