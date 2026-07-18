import { redirect } from 'next/navigation';

import HydrationSafe from '@/components/shared/HydrationSafe';
import { AuthCard } from '@/features/shared/auth/components/AuthCard';
import { RouteService } from '@/services/route.service';

interface LoginPageProps {
  searchParams: Promise<{ gate?: string }>;
}

/**
 * Public login. `?gate=admin` mirrors original-karvita.html discovery and
 * redirects to the standalone admin OTP gate.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { gate } = await searchParams;
  if (gate === 'admin') {
    redirect(RouteService.auth.adminGate());
  }

  return (
    <main
      className="kv-brand-atmosphere flex min-h-dvh w-full items-center justify-center p-kv-inset"
      dir="rtl"
    >
      <HydrationSafe>
        <AuthCard defaultTab="login" />
      </HydrationSafe>
    </main>
  );
}
