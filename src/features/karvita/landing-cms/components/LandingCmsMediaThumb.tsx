'use client';

import { FaIcon } from '@/components/shared/FaIcon';

import { resolveLandingIcon } from '../constants';

type LandingCmsMediaThumbProps = {
  imageUrl?: string;
  iconStem?: string;
  alt: string;
  variant?: 'banner' | 'icon';
};

export function LandingCmsMediaThumb({
  imageUrl,
  iconStem = 'fa-link',
  alt,
  variant = 'icon',
}: LandingCmsMediaThumbProps) {
  if (imageUrl) {
    return (
      // Data-URL / mock blob previews — next/image does not apply here.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={alt}
        className={
          variant === 'banner'
            ? 'mx-auto h-10 w-16 rounded-kv-control border border-kv-border object-cover'
            : 'size-8 rounded-kv-control border border-kv-border object-contain p-0.5'
        }
      />
    );
  }

  return (
    <span className="mx-auto flex size-8 items-center justify-center rounded-kv-control border border-kv-border bg-kv-surface-muted text-kv-text-muted">
      <FaIcon icon={resolveLandingIcon(iconStem)} size="xs" />
      <span className="sr-only">{alt}</span>
    </span>
  );
}
