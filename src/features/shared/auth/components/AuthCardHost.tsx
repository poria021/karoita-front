'use client';

import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { readReturnUrlParam } from '@/lib/return-url';
import { RouteService } from '@/services/route.service';

import { AuthCard } from './AuthCard';
import type { AuthCardSurface } from '../lib/authHrefs';

function surfaceFromPath(pathname: string): AuthCardSurface {
  if (pathname === RouteService.auth.register()) return 'register';
  if (pathname === RouteService.auth.forgot()) return 'forgot';
  return 'login';
}

/**
 * Keeps the auth card mounted across login/register/forgot so the form
 * does not flash empty while the RSC page swaps.
 */
export function AuthCardHost() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathSurface = surfaceFromPath(pathname);
  const [pendingSurface, setPendingSurface] = useState<AuthCardSurface | null>(
    null
  );

  // تا وقتی pathname به تب کلیک‌شده برسد، همان سطح را نشان بده؛ بعد pending را خالی کن.
  if (pendingSurface !== null && pendingSurface === pathSurface) {
    setPendingSurface(null);
  }

  const surface = pendingSurface ?? pathSurface;
  const returnUrl = readReturnUrlParam(searchParams);

  return (
    <AuthCard
      surface={surface}
      returnUrl={returnUrl}
      onSurfaceIntent={setPendingSurface}
    />
  );
}
