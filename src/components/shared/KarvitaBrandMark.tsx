import Image from 'next/image';

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
        'bg-kv-brand shadow-kv-raised shadow-kv-brand/20',
        'size-8 p-0.5 sm:size-9',
        className
      )}
    >
      <Image
        src="/brand/main-logo.png"
        alt=""
        width={36}
        height={36}
        className="size-full object-contain dark:brightness-0 dark:invert"
      />
    </span>
  );
}
