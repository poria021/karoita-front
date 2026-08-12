import { redirect } from 'next/navigation';

import { isAdminAppSurface } from '@/lib/config';
import { RETURN_URL_PARAM, parseSafeReturnUrl } from '@/lib/return-url';
import { RouteService } from '@/services/route.service';

export function shouldRedirectLoginToAdminGate(searchParams: {
  gate?: string;
}): boolean {
  return isAdminAppSurface() || searchParams.gate === 'admin';
}

export function redirectLoginToAdminGate(returnUrl?: string): never {
  const adminGate = RouteService.auth.adminGate();
  const safeReturn = parseSafeReturnUrl(returnUrl);
  if (safeReturn) {
    redirect(
      `${adminGate}?${RETURN_URL_PARAM}=${encodeURIComponent(safeReturn)}`
    );
  }
  redirect(adminGate);
}
