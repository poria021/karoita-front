'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';
import { buildLoginHref } from '@/lib/return-url';
import { RouteService } from '@/services/route.service';

/**
 * Isolated module: `useSearchParams` must not live in the authenticated
 * dashboard shell graph. Next.js opts any client parent that imports this
 * hook into a Suspense/CSR boundary; on leftover `?tab=` / `?kind=` that
 * becomes a full-document load and the brand boot loader.
 */
export function UnauthenticatedRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.toString();
    const intended = search ? `${pathname}?${search}` : pathname;
    router.replace(buildLoginHref(RouteService.auth.login(), intended));
  }, [pathname, router, searchParams]);

  return <KvBrandLinearLoader fullViewport label="لطفا منتظر بمانید…" />;
}
