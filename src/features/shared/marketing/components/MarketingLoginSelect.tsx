'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { FaIcon } from '@/components/shared/FaIcon';
import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { RouteService } from '@/services/route.service';
import type { LandingProduct } from '@/types/landing-cms';
import { faIcons } from '@/utils/iconMap';

import { resolveMarketingNavTarget } from '../lib/marketingLinks';

function usePwaStandalone(): boolean {
  // Read the initial value from window without SSR; the client-only hook stays cheap.
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isStandalone;
}

type MarketingLoginSelectProps = {
  products: LandingProduct[];
};

function getProductIcon(iconName?: string) {
  if (!iconName) return faIcons.link;
  const key = iconName
    .replace(/^fa-/, '')
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase()) as keyof typeof faIcons;
  return faIcons[key] ?? (faIcons as Record<string, typeof faIcons.link>)[iconName] ?? faIcons.link;
}

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
      icon={getProductIcon(product.icon)}
      size="xl"
      className="text-kv-brand"
    />
  );
}

/**
 * External products keep their own URL; internal ones route to the shared auth gate.
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

function PwaHeader() {
  const router = useRouter();
  return (
    <header className="flex w-full items-center justify-between border-b border-kv-border-muted px-kv-page py-kv-section sm:px-kv-screen">
      {/* سمت راست — برند */}
      <div className="flex items-center gap-kv-inline">
        <div className="flex size-8 items-center justify-center rounded-kv-control bg-kv-brand text-white shadow-kv-raised">
          <KarvitaBrandMark className="h-5 w-auto p-0.5" />
        </div>
        <span className="text-base font-black leading-none tracking-tight text-kv-text">
          کارویتا
        </span>
      </div>

      {/* سمت چپ — دکمه بازگشت */}
      <KvButton
        color="cta"
        appearance="solid"
        size="sm"
        onClick={() => router.back()}
        icon={<FaIcon icon={faIcons.arrowLeft} size="xs" />}
        iconPosition="start"
      >
        بازگشت
      </KvButton>
    </header>
  );
}

export function MarketingLoginSelect({ products }: MarketingLoginSelectProps) {
  const loginFallback = RouteService.auth.login();
  const isPwa = usePwaStandalone();

  return (
    <div
      className="kv-brand-atmosphere kv-blueprint-bg relative flex min-h-dvh w-full flex-col items-center overflow-hidden bg-kv-canvas text-kv-text"
      dir="rtl"
    >
      <div className="relative z-10 flex min-h-dvh w-full max-w-7xl flex-col justify-between px-kv-page sm:px-kv-screen">
        {isPwa && <PwaHeader />}
        <div className="mx-auto my-auto w-full space-y-kv-section text-center">
          <div className="space-y-kv-block pb-kv-group">
          {isPwa && (
            <span className="inline-flex items-center rounded-lg border border-kv-brand-border bg-kv-brand-soft px-kv-group py-kv-inline text-sm font-bold text-kv-brand-soft-fg">
              درگاه ورود یکپارچه سامانه کارویتا
            </span>
          )}
          {!isPwa && (
            <div className="flex items-center justify-center gap-kv-inline">
              <div className="flex size-12 items-center justify-center rounded-kv-control bg-kv-brand text-white shadow-kv-raised">
                <KarvitaBrandMark className="h-7 w-auto p-0.5" />
              </div>
              <KvTypography variant="display" weight="black" as="span">
                کارویتا
              </KvTypography>
            </div>
          )}

          <KvTypography
            variant="title"
            tone="muted"
            align="center"
            as="p"
            className="mx-auto max-w-2xl"
          >
            جهت احراز هویت و دسترسی به پنل تخصصی، روی یکی از سامانه‌های زیر کلیک
            نمایید:
          </KvTypography>
          </div>

          {products.length === 0 ? (
          <div className="flex flex-col items-center gap-kv-group pt-kv-group">
            <KvTypography variant="caption" tone="muted" weight="bold">
              در حال حاضر سامانه‌ای برای انتخاب ثبت نشده است.
            </KvTypography>
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
            <div className="flex flex-wrap justify-center gap-kv-section pt-kv-group">
            {products.map((product) => {
              const target = resolveProductLoginHref(product);
              const cardClass =
                'group flex min-h-[168px] w-full cursor-pointer flex-col items-center gap-kv-group rounded-kv-panel border border-kv-border-muted bg-kv-surface p-kv-group text-center shadow-kv-raised transition-all duration-200 hover:border-kv-brand sm:min-h-[180px]';

              const inner = (
                <>
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-kv-control border border-kv-border bg-kv-surface text-kv-brand shadow-kv-soft">
                    <ProductMark product={product} />
                  </div>
                  <KvTypography
                    variant="subtitle"
                    weight="black"
                    as="h2"
                    className="transition-colors"
                  >
                    {product.title}
                  </KvTypography>
                  <span className="inline-flex items-center gap-kv-field rounded-kv-control border border-kv-border bg-kv-surface-subtle px-kv-inline py-kv-field text-xs font-black text-kv-text-secondary transition-colors group-hover:border-kv-brand group-hover:bg-kv-brand group-hover:text-kv-brand-fg">
                    <FaIcon icon={faIcons.arrowLeft} size="2xs" />
                    <span>ورود به سامانه</span>
                  </span>
                </>
              );

              return (
                <div key={product.id} className="w-full max-w-[16rem]">
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

        <div className="w-full border-t border-kv-border-muted py-kv-section text-center">
          <KvTypography variant="overline" tone="muted" weight="bold" align="center">
            سامانه جامع آموزش نظری، مهارتی و مدیریت دسترسی‌های کارویتا © ۱۴۰۵
          </KvTypography>
        </div>
      </div>
    </div>
  );
}
