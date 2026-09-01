import { cn } from '@/lib/utils';

interface KarvitaBrandMarkProps {
  className?: string;
}

export function KarvitaBrandMark({ className }: KarvitaBrandMarkProps) {
  return (
    <span
      role="img"
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-kv-control',
        // لایت همان جوهر برند؛ در دارک `--kv-brand-fg` تیره است و مارک را خراب می‌کند.
        'bg-kv-brand text-kv-brand-fg dark:text-kv-text-bright shadow-kv-raised shadow-kv-brand/20',
        'size-8 p-0.5 sm:size-9',
        className
      )}
    >
      <span className="kv-brand-mark size-full" />
    </span>
  );
}
