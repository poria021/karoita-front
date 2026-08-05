import { cn } from '@/lib/utils';

type KarvitaWordmarkTextProps = {
  className?: string;
};

/**
 * Official typography wordmark — same glyph as header.
 * Tint with text-kv-* / currentColor.
 */
export function KarvitaWordmarkText({ className }: KarvitaWordmarkTextProps) {
  return (
    <span
      role="img"
      aria-label="کارویتا"
      className={cn(
        'kv-brand-wordmark inline-block w-[7.5rem] text-current',
        className
      )}
    />
  );
}
