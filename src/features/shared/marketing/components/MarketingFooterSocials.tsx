import Image from 'next/image';
import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import type { LandingSocial } from '@/types/landing-cms';
import { faIcons, iconMap } from '@/utils/iconMap';

import { resolveMarketingNavTarget } from '../lib/marketingLinks';

type MarketingFooterSocialsProps = {
  socials: LandingSocial[];
};

function SocialMark({ social }: { social: LandingSocial }) {
  if (social.iconImageUrl) {
    const isRemote =
      social.iconImageUrl.startsWith('http://') ||
      social.iconImageUrl.startsWith('https://') ||
      social.iconImageUrl.startsWith('data:');

    if (isRemote) {
      return (
        // Data-URL / remote mock assets — next/image remote config may not apply.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={social.iconImageUrl}
          alt=""
          className="size-4 object-contain"
        />
      );
    }

    return (
      <Image
        src={social.iconImageUrl}
        alt=""
        width={16}
        height={16}
        className="size-4 object-contain"
      />
    );
  }

  return (
    <FaIcon
      icon={iconMap[social.icon] ?? faIcons.link}
      size="xs"
      className="text-kv-brand"
    />
  );
}

/** Quiet footer social row — accessible labels, kv chrome only. */
export function MarketingFooterSocials({
  socials,
}: MarketingFooterSocialsProps) {
  if (socials.length === 0) return null;

  return (
    <nav aria-label="شبکه‌های اجتماعی کارویتا">
      <ul className="flex flex-wrap items-center justify-center gap-kv-inline">
        {socials.map((social) => {
          const target = resolveMarketingNavTarget(social.link);
          const className =
            'inline-flex size-8 items-center justify-center overflow-hidden rounded-kv-control bg-kv-surface-subtle text-xs text-kv-brand transition hover:scale-110 hover:bg-kv-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring';

          const content = (
            <>
              <SocialMark social={social} />
              <span className="sr-only">{social.name}</span>
            </>
          );

          return (
            <li key={social.id}>
              {target.kind === 'external' ? (
                <a
                  href={target.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                  aria-label={social.name}
                >
                  {content}
                </a>
              ) : null}
              {target.kind === 'internal' ? (
                <Link
                  href={target.href}
                  prefetch={false}
                  className={className}
                  aria-label={social.name}
                >
                  {content}
                </Link>
              ) : null}
              {target.kind === 'none' ? (
                <span className={className} aria-label={social.name}>
                  {content}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
