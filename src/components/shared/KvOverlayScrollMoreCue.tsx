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

/**
 * Icon-only bottom cue for long overlays — no copy.
 * Hovering the chevron nudges edge auto-scroll downward.
 */
export function KvOverlayScrollMoreCue({
  visible,
  onHoverStart,
  onHoverEnd,
  className,
}: KvOverlayScrollMoreCueProps) {
  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      data-slot="kv-overlay-scroll-more-cue"
      className={cn(
        'pointer-events-none flex shrink-0 justify-center',
        'bg-gradient-to-t from-kv-surface from-35% via-kv-surface/90 to-transparent',
        'pt-3 pb-1',
        className
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className={cn(
          'pointer-events-auto flex size-7 cursor-pointer items-center justify-center',
          'rounded-full border border-kv-border bg-kv-surface-muted text-kv-text-muted',
          'shadow-kv-raised transition-colors',
          'hover:bg-kv-surface-subtle hover:text-kv-text-secondary'
        )}
        onPointerEnter={onHoverStart}
        onPointerLeave={onHoverEnd}
      >
        <FaIcon icon={faIcons.chevronDown} size="2xs" />
      </button>
    </div>
  );
}
