'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  const user = useUserStore((s) => s.activeUser);

  const pathname =
    typeof window !== 'undefined'
      ? window.location.pathname || routerPathname
      : routerPathname;

  const href = resolveNearestLivePath(pathname, user);

  return (
    <KvButton asChild color={color} appearance={appearance}>
      <Link href={href} prefetch={false}>
        {label}
      </Link>
    </KvButton>
  );
}