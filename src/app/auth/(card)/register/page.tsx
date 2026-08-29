import { AuthCard } from '@/features/shared/auth/components/AuthCard';
import { parseSafeReturnUrl } from '@/lib/return-url';

interface RegisterPageProps {
  searchParams: Promise<{ returnUrl?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return (
    <AuthCard surface="register" returnUrl={parseSafeReturnUrl(params.returnUrl)} />
  );
}
