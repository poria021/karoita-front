'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';
import { buildLoginHref } from '@/lib/return-url';
import { RouteService } from '@/services/route.service';

/**
 * ماژول جدا: `useSearchParams` نباید در گراف شل داشبورد احرازشده باشد.
 * Next هر والد کلاینتی که این هوک را import کند به مرز Suspense/CSR می‌برد؛
 * با `?tab=` / `?kind=` باقی‌مانده بارگذاری سند کامل و لودر برند می‌شود.
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
