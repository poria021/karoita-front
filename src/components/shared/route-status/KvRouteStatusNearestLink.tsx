'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  KvButton,
  type KvButtonAppearance,
  type KvButtonColor,
} from '@/components/shared/KvButton';
import {
  getPostLoginPath,
  resolveNearestLivePath,
} from '@/services/post-login-path';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';

type KvRouteStatusNearestLinkProps = {
  color?: KvButtonColor;
  appearance?: KvButtonAppearance;
  label?: string;
};

/**
 * CTA → nearest live URL related to the address bar path (role-aware).
 * Hidden when recovery would only duplicate landing / میز کار / login.
 */
export function KvRouteStatusNearestLink({
  color = 'cta',
  appearance = 'solid',
  label = 'بازگشت به بخش مرتبط',
}: KvRouteStatusNearestLinkProps) {
  const routerPathname = usePathname() || '/';
  const [pathname, setPathname] = useState(routerPathname);
  const user = useUserStore((s) => s.activeUser);

  useEffect(() => {
    // During App Router not-found, prefer the real address bar path.
    const fromWindow =
      typeof window !== 'undefined' ? window.location.pathname : '';
    setPathname(fromWindow || routerPathname);
  }, [routerPathname]);

  const href = resolveNearestLivePath(pathname, user);
  const home = getPostLoginPath(user);
  const isDuplicateHome =
    href === home ||
    href === RouteService.karvita.entry() ||
    href === RouteService.auth.login() ||
    href === RouteService.marketing.home();

  if (isDuplicateHome) {
    return null;
  }

  return (
    <KvButton asChild color={color} appearance={appearance}>
      <Link href={href} prefetch={false}>
        {label}
      </Link>
    </KvButton>
  );
}
