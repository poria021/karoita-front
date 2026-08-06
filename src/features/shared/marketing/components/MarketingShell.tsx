'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvButton } from '@/components/shared/KvButton';
import { RouteService } from '@/services/route.service';
import type { LandingProduct, LandingSocial } from '@/types/landing-cms';
import { faIcons } from '@/utils/iconMap';

import {
  MarketingPanelProvider,
  useMarketingPanel,
  type MarketingPanelId,
} from '../lib/marketingPanelContext';
import { resolveMarketingLoginHref } from '../lib/marketingLinks';
import { MarketingFooterSocials } from './MarketingFooterSocials';
import { MarketingProductsDock } from './MarketingProductsDock';

const NAV_ITEMS: ReadonlyArray<{
  id: MarketingPanelId | null;
  label: string;
}> = [
  { id: null, label: 'خانه' },
  { id: 'benefits', label: 'ارزش‌های عملیاتی' },
  { id: 'about', label: 'درباره ما' },
  { id: 'internship', label: 'سامانه کارآموزی' },
  { id: 'advantages', label: 'مزایای پلتفرم' },
];

type MarketingShellProps = {
  products: LandingProduct[];
  socials: LandingSocial[];
  children: ReactNode;
  /** When true, header sits over the hero composition. */
  overlayHeader?: boolean;
};

function MarketingShellInner({
  products,
  socials,
  children,
  overlayHeader = false,
}: MarketingShellProps) {
  const loginHref = resolveMarketingLoginHref(products.length);
  const pathname = usePathname();
  const isHomePage = pathname === RouteService.marketing.home();
  const [isScrolled, setIsScrolled] = useState(false);
  const { activePanel, openPanel } = useMarketingPanel();

  useEffect(() => {
    if (!overlayHeader) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [overlayHeader]);

  const headerShouldBeTransparent = overlayHeader && isHomePage && !isScrolled;
  const headerTextClass = headerShouldBeTransparent
    ? 'text-white drop-shadow-md'
    : 'text-kv-text';

  return (
    <div
      className="kv-brand-atmosphere kv-blueprint-bg relative flex min-h-dvh w-full flex-col"
      dir="rtl"
    >
      <MarketingProductsDock products={products} />

      <header
        className={`fixed inset-x-0 top-0 z-50 flex flex-col transition-all duration-300 ${
          headerShouldBeTransparent
            ? 'bg-gradient-to-b from-black/90 via-black/60 to-black/10 text-white'
            : 'border-b border-kv-border/60 bg-kv-surface/80 text-kv-text shadow-kv-raised backdrop-blur-md supports-[backdrop-filter]:bg-kv-surface/70'
        }`}
      >
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-kv-group border-none px-kv-inset sm:px-kv-page lg:h-16">
          <Link
            href={RouteService.marketing.home()}
            onClick={() => openPanel(null)}
            className="group flex items-center gap-kv-inline focus:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring"
            aria-label="صفحه اصلی کارویتا"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-kv-brand text-white shadow-md shadow-kv-raised">
              <KarvitaBrandMark className="h-5 w-auto p-0.5" />
            </div>
            <div className="flex flex-col">
              <span
                className={`text-base font-black leading-none tracking-tight transition-colors sm:text-lg ${headerTextClass}`}
              >
                کارویتا
              </span>
            </div>
          </Link>

          <nav
            aria-label="منوی اصلی دسکتاپ"
            className={`hidden items-center gap-7 text-xs font-bold lg:flex ${
              headerShouldBeTransparent ? 'text-white/90' : 'text-kv-text-secondary'
            }`}
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.id === null ? activePanel === null : activePanel === item.id;
              const href = item.id ? `#${item.id}` : '#hero';
              return (
                <a
                  key={item.label}
                  href={href}
                  className={`transition-colors hover:text-kv-brand ${
                    isActive
                      ? 'font-extrabold text-kv-brand underline decoration-kv-brand decoration-2 underline-offset-8'
                      : headerShouldBeTransparent
                        ? 'text-white/90'
                        : 'text-kv-text-secondary'
                  }`}
                  onClick={(event) => {
                    event.preventDefault();
                    openPanel(item.id);
                  }}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-kv-pair">
            <KvButton asChild color="cta" size="sm" className="shadow-md">
              <Link href={loginHref} prefetch={false}>
                <FaIcon
                  icon={faIcons.arrowLeft}
                  size="xs"
                  className="rtl:rotate-180"
                />
                <span>ورود به سامانه</span>
              </Link>
            </KvButton>
          </div>
        </div>
      </header>

      <main
        className={`flex w-full flex-1 flex-col ${
          overlayHeader ? '' : 'pt-14 lg:pt-16'
        }`}
      >
        {children}
      </main>

      <footer className="relative z-10 overflow-hidden border-t border-kv-border-muted bg-kv-surface/90 pb-6 pt-12 md:pt-16">
        <div className="relative z-10 mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 gap-8 pb-8 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-7">
              <Link
                href={RouteService.marketing.home()}
                onClick={() => openPanel(null)}
                className="flex items-center gap-3.5 transition-opacity hover:opacity-80"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-kv-brand font-black text-xl text-kv-brand-fg shadow-md shadow-kv-brand/20">
                  K
                </div>
                <span className="text-3xl font-black leading-none tracking-tight text-kv-text">
                  کارویتا
                </span>
              </Link>

              <div className="max-w-xl space-y-2 text-xs font-semibold text-kv-text-secondary">
                <p className="max-w-lg text-xs font-bold leading-relaxed text-kv-text-muted">
                  شرکت کارویتا؛ مجری زیرساخت‌های هوشمند آموزش نظری، مهارتی و
                  مدیریت دسترسی‌های سازمانی کشور.
                </p>
                <address className="flex flex-wrap items-center gap-2 text-xs font-bold not-italic text-kv-text-secondary">
                  <FaIcon icon={faIcons.mapLocationDot} className="text-kv-brand" />
                  <span>
                    تهران، خیابان انقلاب، شرکت کارویتا (کد پستی: ۱۴۱۷۷۵۳۱۱۱)
                  </span>
                  <span aria-hidden>|</span>
                  <a
                    href="tel:+982191222079"
                    className="text-kv-brand underline-offset-2 transition-colors hover:underline"
                  >
                    تلفن: ۰۲۱-۹۱۲۲۲۰۷۹
                  </a>
                </address>
              </div>

              <div className="pt-1">
                <div className="group inline-flex items-center gap-3 rounded-kv-control border-2 border-kv-brand-border bg-kv-surface px-4 py-2.5">
                  <div className="flex items-center gap-1.5 rounded-sm bg-kv-brand-soft px-2.5 py-1.5 text-xs font-black text-kv-brand">
                    <FaIcon icon={faIcons.mobileScreen} size="xs" />
                    <FaIcon icon={faIcons.tabletScreenButton} size="xs" />
                    <FaIcon icon={faIcons.desktop} size="xs" />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-black text-kv-text">
                      نصب و اجرای مستقیم (PWA)
                    </span>
                  </div>
                  <FaIcon
                    icon={faIcons.arrowLeft}
                    size="xs"
                    className="me-0 ms-2 text-kv-brand"
                  />
                </div>
              </div>
            </div>

            <div className="my-auto flex items-center justify-center lg:col-span-5 lg:justify-end">
              <div className="grid w-auto grid-cols-3 gap-2.5">
                <button
                  onClick={(e) => e.preventDefault()}
                  className="flex h-32 w-28 cursor-pointer select-none items-center justify-center rounded-xl border border-kv-border-muted bg-kv-surface-subtle/80 p-2 text-center text-[10px] font-black leading-snug text-kv-text shadow-sm transition-all duration-300 hover:border-kv-brand hover:bg-kv-surface hover:text-kv-brand"
                >
                  نماد اعتماد الکترونیکی
                </button>

                <button
                  onClick={(e) => e.preventDefault()}
                  className="flex h-32 w-28 cursor-pointer select-none items-center justify-center rounded-xl border border-kv-border-muted bg-kv-surface-subtle/80 p-2 text-center text-[10px] font-black leading-snug text-kv-text shadow-sm transition-all duration-300 hover:border-kv-success hover:bg-kv-surface hover:text-kv-success"
                >
                  نشان ملی ساماندهی
                </button>

                <button
                  onClick={(e) => e.preventDefault()}
                  className="flex h-32 w-28 cursor-pointer select-none items-center justify-center rounded-xl border border-kv-border-muted bg-kv-surface-subtle/80 p-2 text-center text-[10px] font-black leading-snug text-kv-text shadow-sm transition-all duration-300 hover:border-kv-violet hover:bg-kv-surface hover:text-kv-violet"
                >
                  تاییدیه دانش‌بنیان
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-kv-inset sm:px-kv-page">
          <div className="flex flex-col items-center justify-between gap-4 border-t border-kv-border-muted pt-4 text-[11px] font-bold text-kv-text-muted sm:flex-row">
            <MarketingFooterSocials socials={socials} />

            <p>تمامی حقوق مادی و معنوی این سامانه متعلق به شرکت کارویتا می‌باشد. © ۱۴۰۵</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function MarketingShell(props: MarketingShellProps) {
  return (
    <MarketingPanelProvider>
      <MarketingShellInner {...props} />
    </MarketingPanelProvider>
  );
}
