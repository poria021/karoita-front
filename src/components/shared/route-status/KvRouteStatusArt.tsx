'use client';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { FaIcon } from '@/components/shared/FaIcon';
import type { KvRouteStatusKind } from '@/components/shared/route-status/kinds';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

type ArtConfig = {
  icon: IconDefinition;
  wellClass: string;
  iconClass: string;
  ringClass: string;
};

/** Ready Font Awesome vectors from the project icon map. */
const ART_BY_KIND: Record<KvRouteStatusKind, ArtConfig> = {
  notFound: {
    icon: faIcons.magnifyingGlass,
    wellClass: 'bg-kv-brand-soft',
    iconClass: 'text-kv-brand-soft-fg',
    ringClass: 'stroke-kv-brand',
  },
  error: {
    icon: faIcons.triangleExclamation,
    wellClass: 'bg-kv-danger-soft',
    iconClass: 'text-kv-danger-soft-fg',
    ringClass: 'stroke-kv-danger',
  },
};

/**
 * Ready-made FA vector in a soft well + light geometric line rings.
 */
export function KvRouteStatusArt({
  kind,
  className,
}: {
  kind: KvRouteStatusKind;
  className?: string;
}) {
  const art = ART_BY_KIND[kind];

  return (
    <div
      className={cn(
        'kv-route-status-art relative mx-auto flex size-[140px] items-center justify-center sm:size-[160px]',
        className
      )}
      aria-hidden
    >
      {/* Geometric line rings (ready pattern, not custom illustration) */}
      <svg
        viewBox="0 0 220 220"
        className={cn(
          'pointer-events-none absolute inset-0 size-full fill-none',
          art.ringClass
        )}
      >
        <circle
          cx="110"
          cy="110"
          r="104"
          strokeWidth="1"
          strokeDasharray="2 8"
          className="opacity-35"
        />
        <circle
          cx="110"
          cy="110"
          r="86"
          strokeWidth="1"
          strokeDasharray="1 6"
          className="opacity-25"
        />
        <path
          d="M110 8v12M110 200v12M8 110h12M200 110h12"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="opacity-35"
        />
        <path
          d="M28 28h12M28 28v12M192 28h-12M192 28v12M28 192h12M28 192v-12M192 192h-12M192 192v-12"
          strokeWidth="1.35"
          strokeLinecap="square"
          className="opacity-40"
        />
      </svg>

      <div
        className={cn(
          'relative flex size-20 items-center justify-center rounded-full shadow-kv-soft sm:size-24',
          art.wellClass,
          art.iconClass
        )}
      >
        <FaIcon icon={art.icon} size="xl" />
      </div>
    </div>
  );
}
