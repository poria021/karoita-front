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
 * CTA → nearest live ancestor of the current URL (role-aware).
 */
export function KvRouteStatusNearestLink({
  color = 'cta',
  appearance = 'solid',
  label = 'بازگشت به بخش مرتبط',
}: KvRouteStatusNearestLinkProps) {
  const pathname = usePathname() || '/';
  const user = useUserStore((s) => s.activeUser);
  const href = resolveNearestLivePath(pathname, user);

  return (
    <KvButton asChild color={color} appearance={appearance}>
      <Link href={href} prefetch={false}>
        {label}
      </Link>
    </KvButton>
  );
}
