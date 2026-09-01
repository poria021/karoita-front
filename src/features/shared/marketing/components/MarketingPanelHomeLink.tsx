'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { RouteService } from '@/services/route.service';

import { useMarketingPanel } from '../lib/marketingPanelContext';

type MarketingPanelHomeLinkProps = {
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
};

/** کنترل برند/خانه که پنل باز مارکتینگ را هم می‌بندد. */
export function MarketingPanelHomeLink({
  children,
  className,
  'aria-label': ariaLabel,
}: MarketingPanelHomeLinkProps) {
  const { openPanel } = useMarketingPanel();

  return (
    <Link
      href={RouteService.marketing.home()}
      onClick={() => openPanel(null)}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}
