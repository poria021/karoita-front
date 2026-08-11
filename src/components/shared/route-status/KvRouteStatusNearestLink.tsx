'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  KvButton,
  type KvButtonAppearance,
  type KvButtonColor,
} from '@/components/shared/KvButton';
import { resolveNearestLivePath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';

type KvRouteStatusNearestLinkProps = {
  color?: KvButtonColor;
  appearance?: KvButtonAppearance;
  label?: string;
};

/**
 * Primary recovery CTA → nearest live URL for the address bar path (role-aware).
 * Always rendered; callers pair it with a secondary landing / desk button.
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

  return (
    <KvButton asChild color={color} appearance={appearance}>
      <Link href={href} prefetch={false}>
        {label}
      </Link>
    </KvButton>
  );
}
