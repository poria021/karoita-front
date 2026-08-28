import { AuthCard } from '@/features/shared/auth/components/AuthCard';
import {
  redirectLoginToAdminGate,
  shouldRedirectLoginToAdminGate,
} from '@/features/shared/auth/lib/resolveLoginRedirect';

interface LoginRoutePageProps {
  searchParams: Promise<{ gate?: string; returnUrl?: string }>;
}

export default async function LoginRoutePage({
  searchParams,
}: LoginRoutePageProps) {
  const params = await searchParams;

  if (shouldRedirectLoginToAdminGate(params)) {
    redirectLoginToAdminGate(params.returnUrl);
  }

  return <AuthCard surface="login" />;
}
