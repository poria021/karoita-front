'use client';

import Image from 'next/image';
import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import type { LandingProduct } from '@/types/landing-cms';
import { faIcons } from '@/utils/iconMap';

import { useMarketingPanel } from '../lib/marketingPanelContext';
import { resolveMarketingNavTarget } from '../lib/marketingLinks';

type MarketingProductsDockProps = {
  products: LandingProduct[];
};

function getProductIcon(iconName?: string) {
  if (!iconName) return faIcons.link;
  const key = iconName
    .replace(/^fa-/, '')
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase()) as keyof typeof faIcons;
  return faIcons[key] ?? (faIcons as Record<string, typeof faIcons.link>)[iconName] ?? faIcons.link;
}

function DockMark({ product }: { product: LandingProduct }) {
  if (product.logoImageUrl) {
    const isRemote =
      product.logoImageUrl.startsWith('http://') ||
      product.logoImageUrl.startsWith('https://') ||
      product.logoImageUrl.startsWith('data:');

    if (isRemote) {
      return (
        // data-URL / دارایی موک ریموت — تنظیم remote `next/image` ممکن است اعمال نشود.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.logoImageUrl}
          alt={product.title}
          className="size-full object-contain p-0.5"
        />
      );
    }

    return (
      <Image
        src={product.logoImageUrl}
        alt={product.title}
        width={32}
        height={32}
        className="size-full object-contain p-0.5"
      />
    );
  }

  return (
    <FaIcon
      icon={getProductIcon(product.icon)}
      size="xs"
      className="text-current"
    />
  );
}

/**
 * داک شناور آرام محصول — صفحهٔ برندپررنگ، chrome سازمانی.
 * هر آیتم عنوان خودش را LTR روی hover باز می‌کند (همسایه‌ها جمع می‌مانند).
 */
export function MarketingProductsDock({ products }: MarketingProductsDockProps) {
  const { openPanel } = useMarketingPanel();

  if (products.length === 0) return null;

  return (
    <nav
      aria-label="محصولات کارویتا"
      className="pointer-events-none fixed inset-y-0 start-0 z-40 hidden items-center ps-kv-page md:flex"
      dir="ltr"
    >
      <ul className="pointer-events-auto flex w-max flex-col items-start gap-kv-pair">
        {products.map((product) => {
          const target = resolveMarketingNavTarget(product.link);
          const label = product.title;
          const itemClass =
            'kv-dock-item group/dock items-center overflow-hidden rounded-kv-control border border-kv-border bg-kv-surface/90 p-0 shadow-kv-raised backdrop-blur-md';

          const inner = (
            <>
              <span className="kv-dock-mark flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-kv-control border border-kv-border bg-kv-text text-kv-canvas shadow-kv-soft">
                <DockMark product={product} />
              </span>
              <span className="kv-dock-item-label">
                <span
                  dir="rtl"
                  className="whitespace-nowrap px-3 text-xs font-black text-kv-text"
                >
                  {label}
                </span>
              </span>
            </>
          );

          return (
            <li key={product.id} className="w-max max-w-full">
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
              {target.kind === 'panel' ? (
                <button
                  type="button"
                  onClick={() => openPanel(target.id)}
                  className={itemClass}
                  aria-label={label}
                >
                  {inner}
                </button>
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