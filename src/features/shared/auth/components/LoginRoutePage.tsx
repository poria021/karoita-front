import { AuthCard } from '@/features/shared/auth/components/AuthCard';
import {
  redirectLoginToAdminGate,
  shouldRedirectLoginToAdminGate,
} from '@/features/shared/auth/lib/resolveLoginRedirect';
import { parseSafeReturnUrl } from '@/lib/return-url';

interface LoginRoutePageProps {
  searchParams: Promise<{ gate?: string; returnUrl?: string }>;
}

export default async function LoginRoutePage({
  searchParams,
}: LoginRoutePageProps) {
  const params = await searchParams;
  const returnUrl = parseSafeReturnUrl(params.returnUrl);

  if (shouldRedirectLoginToAdminGate(params)) {
    redirectLoginToAdminGate(params.returnUrl);
  }

  return <AuthCard surface="login" returnUrl={returnUrl} />;
}
