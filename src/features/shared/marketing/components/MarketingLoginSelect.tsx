'use client';

import Image from 'next/image';
import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { RouteService } from '@/services/route.service';
import type { LandingProduct } from '@/types/landing-cms';
import { faIcons, iconMap } from '@/utils/iconMap';

import { resolveMarketingNavTarget } from '../lib/marketingLinks';

type MarketingLoginSelectProps = {
  products: LandingProduct[];
};

function ProductMark({ product }: { product: LandingProduct }) {
  if (product.logoImageUrl) {
    const isRemote =
      product.logoImageUrl.startsWith('http://') ||
      product.logoImageUrl.startsWith('https://') ||
      product.logoImageUrl.startsWith('data:');

    if (isRemote) {
      return (
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
        width={48}
        height={48}
        className="size-full object-cover"
      />
    );
  }

  return (
    <FaIcon
      icon={iconMap[product.icon] ?? faIcons.link}
      className="text-xl text-kv-brand-fg"
    />
  );
}

/**
 * Portal picker → auth login (Nest role simulator from HTML is not ported).
 * Absolute product URLs stay external; everything else enters the auth gate.
 */
function resolveProductLoginHref(product: LandingProduct): {
  kind: 'external' | 'internal';
  href: string;
} {
  const target = resolveMarketingNavTarget(product.link);
  if (target.kind === 'external') {
    return target;
  }
  return { kind: 'internal', href: RouteService.auth.login() };
}

export function MarketingLoginSelect({ products }: MarketingLoginSelectProps) {
  const loginFallback = RouteService.auth.login();

  return (
    <div
      className="kv-brand-atmosphere kv-blueprint-bg relative flex min-h-dvh w-full flex-col justify-between overflow-hidden bg-kv-canvas p-6 text-kv-text sm:p-12"
      dir="rtl"
    >
      <div className="relative z-10 mx-auto my-auto w-full max-w-6xl space-y-8 py-10 text-center">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-kv-brand-border bg-kv-brand-soft px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-kv-brand-soft-fg shadow-sm">
            <span className="size-1.5 rounded-full bg-kv-brand" /> درگاه ورود
            یکپارچه
          </span>
          <h1 className="text-2xl font-black tracking-tight text-kv-text sm:text-4xl">
            سامانه مورد نظر خود را جهت ورود انتخاب کنید
          </h1>
          <p className="mx-auto max-w-lg text-xs font-semibold text-kv-text-muted sm:text-sm">
            جهت احراز هویت و دسترسی به پنل تخصصی، روی یکی از سامانه‌های زیر کلیک
            نمایید:
          </p>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-4">
            <p className="text-xs font-bold text-kv-text-muted">
              در حال حاضر سامانه‌ای برای انتخاب ثبت نشده است.
            </p>
            <KvButton asChild color="cta" size="md">
              <Link href={loginFallback} prefetch={false}>
                <FaIcon
                  icon={faIcons.arrowLeft}
                  size="xs"
                  className="rtl:rotate-180"
                />
                <span>ورود به سامانه</span>
              </Link>
            </KvButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const target = resolveProductLoginHref(product);
              const cardClass =
                'group flex min-h-[168px] cursor-pointer flex-col items-center gap-kv-group rounded-kv-panel border border-kv-border-muted bg-kv-surface p-kv-group text-center shadow-kv-raised transition-all duration-200 hover:border-kv-brand sm:min-h-[180px]';

              const inner = (
                <>
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-kv-control bg-kv-brand text-xl text-kv-brand-fg shadow-sm">
                    <ProductMark product={product} />
                  </div>
                  <h2 className="text-sm font-black leading-snug text-kv-text transition-colors">
                    {product.title}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-kv-control border border-kv-border bg-kv-surface-subtle px-3 py-1.5 text-[10px] font-black text-kv-text-secondary transition-colors group-hover:border-kv-brand group-hover:bg-kv-brand group-hover:text-kv-brand-fg">
                    <span>ورود به سامانه</span>
                    <FaIcon
                      icon={faIcons.arrowLeft}
                      size="2xs"
                      className="rtl:rotate-180"
                    />
                  </span>
                </>
              );

              return (
                <div key={product.id}>
                  {target.kind === 'external' ? (
                    <a
                      href={target.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cardClass}
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link
                      href={target.href}
                      prefetch={false}
                      className={cardClass}
                    >
                      {inner}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl border-t border-kv-border-muted pt-6 text-center text-[11px] font-bold text-kv-text-muted">
        سامانه جامع آموزش نظری، مهارتی و مدیریت دسترسی‌های کارویتا © ۱۴۰۵
      </div>
    </div>
  );
}
