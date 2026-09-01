'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

type KvOverlayScrollMoreCueProps = {
  visible: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  className?: string;
};

/** نشانهٔ پایین اورلی؛ هاور اسکرول لبه را به پایین هل می‌دهد. */
export function KvOverlayScrollMoreCue({
  visible,
  onHoverStart,
  onHoverEnd,
  className,
}: KvOverlayScrollMoreCueProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      data-slot="kv-overlay-scroll-more-cue"
      className={cn(
        'flex w-full shrink-0 cursor-pointer items-center justify-center',
        'rounded-none border-t border-kv-border/40 px-3.5 py-2.5',
        'bg-kv-surface text-kv-text-muted',
        'hover:bg-kv-surface-muted hover:text-kv-text-secondary',
        className
      )}
      onPointerEnter={onHoverStart}
      onPointerLeave={onHoverEnd}
    >
      <FaIcon icon={faIcons.chevronDown} size="xs" />
    </button>
  );
}
