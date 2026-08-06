'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { FaIcon } from '@/components/shared/FaIcon';
import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvButton } from '@/components/shared/KvButton';
import { RouteService } from '@/services/route.service';
import { faIcons } from '@/utils/iconMap';

import { MARKETING_NAV_ITEMS } from '../lib/marketingNav';
import { useMarketingPanel } from '../lib/marketingPanelContext';
import { MarketingPanelHomeLink } from './MarketingPanelHomeLink';

type MarketingHeaderProps = {
  loginHref: string;
  /** When true, header sits over the hero and turns solid after scroll. */
  overlayHeader?: boolean;
};

export function MarketingHeader({
  loginHref,
  overlayHeader = false,
}: MarketingHeaderProps) {
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
    ? 'text-white'
    : 'text-kv-text';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex flex-col transition-all duration-300 ${
        headerShouldBeTransparent
          ? 'bg-gradient-to-b from-black/90 via-black/60 to-black/10 text-white'
          : 'border-b border-kv-border/60 bg-kv-surface/80 text-kv-text shadow-kv-raised backdrop-blur-md supports-[backdrop-filter]:bg-kv-surface/70'
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-kv-group border-none px-kv-inset sm:px-kv-page lg:h-16">
        <MarketingPanelHomeLink
          className="group flex items-center gap-kv-inline focus:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring"
          aria-label="صفحه اصلی کارویتا"
        >
          <div className="flex size-8 items-center justify-center rounded-kv-control bg-kv-brand text-white shadow-kv-raised">
            <KarvitaBrandMark className="h-5 w-auto p-0.5" />
          </div>
          <div className="flex flex-col">
            <span
              className={`text-base font-black leading-none tracking-tight transition-colors sm:text-lg ${headerTextClass}`}
            >
              کارویتا
            </span>
          </div>
        </MarketingPanelHomeLink>

        <nav
          aria-label="منوی اصلی دسکتاپ"
          className={`hidden items-center gap-7 text-xs font-bold lg:flex ${
            headerShouldBeTransparent ? 'text-white/90' : 'text-kv-text-secondary'
          }`}
        >
          {MARKETING_NAV_ITEMS.map((item) => {
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
          <KvButton asChild color="cta" size="sm" className="shadow-kv-raised">
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
  );
}
