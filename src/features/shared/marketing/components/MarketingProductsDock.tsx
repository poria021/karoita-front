'use client';

import Image from 'next/image';
import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import type { LandingProduct } from '@/types/landing-cms';
import { faIcons, iconMap } from '@/utils/iconMap';

import { resolveMarketingNavTarget } from '../lib/marketingLinks';

type MarketingProductsDockProps = {
  products: LandingProduct[];
};

function DockMark({ product }: { product: LandingProduct }) {
  if (product.logoImageUrl) {
    const isRemote =
      product.logoImageUrl.startsWith('http://') ||
      product.logoImageUrl.startsWith('https://') ||
      product.logoImageUrl.startsWith('data:');

    if (isRemote) {
      return (
        // Data-URL / remote mock assets — next/image remote config may not apply.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.logoImageUrl}
          alt=""
          className="size-full object-cover"
        />
      );
    }

    return (
      <Image
        src={product.logoImageUrl}
        alt=""
        width={32}
        height={32}
        className="size-full object-cover"
      />
    );
  }

  return (
    <FaIcon
      icon={iconMap[product.icon] ?? faIcons.link}
      size="xs"
      className="text-kv-brand-fg"
    />
  );
}

/**
 * Quiet floating product dock — brand-loud page, institutional chrome (rule 90).
 * Fixed on the inline-start edge with logical positioning.
 */
export function MarketingProductsDock({ products }: MarketingProductsDockProps) {
  if (products.length === 0) return null;

  return (
    <nav
      aria-label="محصولات کارویتا"
      className="pointer-events-none fixed inset-y-0 start-0 z-40 hidden items-center ps-kv-page md:flex"
      dir="ltr"
    >
      <ul className="pointer-events-auto flex flex-col gap-kv-pair">
        {products.map((product) => {
          const target = resolveMarketingNavTarget(product.link);
          const label = product.title;
          const itemClass =
            'group flex w-8 shrink-0 items-center overflow-hidden rounded-xl border border-kv-border bg-kv-surface/90 p-0 shadow-md backdrop-blur-md transition-all duration-300 ease-out grayscale hover:w-max hover:grayscale-0 focus-within:w-max focus-within:grayscale-0';

          const inner = (
            <>
              <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-kv-brand text-kv-brand-fg shadow-sm">
                <DockMark product={product} />
              </span>
              <span
                dir="rtl"
                className="whitespace-nowrap px-3 text-[11px] font-black text-kv-text opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
              >
                {label}
              </span>
            </>
          );

          return (
            <li key={product.id}>
              {target.kind === 'external' ? (
                <a
                  href={target.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={itemClass}
                  aria-label={label}
                >
                  {inner}
                </a>
              ) : null}
              {target.kind === 'internal' ? (
                <Link
                  href={target.href}
                  prefetch={false}
                  className={itemClass}
                  aria-label={label}
                >
                  {inner}
                </Link>
              ) : null}
              {target.kind === 'none' ? (
                <span className={itemClass} aria-label={label}>
                  {inner}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
