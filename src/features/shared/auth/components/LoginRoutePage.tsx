import { AuthCard } from '@/features/shared/auth/components/AuthCard';
import { AuthPageShell } from '@/features/shared/auth/components/AuthPageShell';
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

  return (
    <AuthPageShell>
      <AuthCard surface="login" />
    </AuthPageShell>
  );
}
