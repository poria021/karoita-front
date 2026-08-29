'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { RETURN_URL_PARAM, parseSafeReturnUrl } from '@/lib/return-url';
import { RouteService } from '@/services/route.service';

import { AuthCard } from './AuthCard';
import type { AuthCardSurface } from '../lib/authHrefs';

function surfaceFromPath(pathname: string): AuthCardSurface {
  if (pathname === RouteService.auth.register()) return 'register';
  if (pathname === RouteService.auth.forgot()) return 'forgot';
  return 'login';
}

function readReturnUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return parseSafeReturnUrl(
    new URLSearchParams(window.location.search).get(RETURN_URL_PARAM)
  );
}

/**
 * Keeps the auth card mounted across login/register/forgot so the form
 * does not flash empty while the RSC page swaps.
 */
export function AuthCardHost() {
  const pathname = usePathname();
  const pathSurface = surfaceFromPath(pathname);
  const [pendingSurface, setPendingSurface] = useState<AuthCardSurface | null>(
    null
  );
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    setReturnUrl(readReturnUrl());
  }, [pathname]);

  useEffect(() => {
    if (pendingSurface && pathSurface === pendingSurface) {
      setPendingSurface(null);
    }
  }, [pathSurface, pendingSurface]);

  const surface = pendingSurface ?? pathSurface;

  return (
    <AuthCard
      surface={surface}
      returnUrl={returnUrl}
      onSurfaceIntent={setPendingSurface}
    />
  );
}
