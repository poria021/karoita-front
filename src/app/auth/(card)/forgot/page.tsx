import { AuthCard } from '@/features/shared/auth/components/AuthCard';
import { parseSafeReturnUrl } from '@/lib/return-url';

interface ForgotPageProps {
  searchParams: Promise<{ returnUrl?: string }>;
}

export default async function ForgotPage({ searchParams }: ForgotPageProps) {
  const params = await searchParams;

  return (
    <AuthCard surface="forgot" returnUrl={parseSafeReturnUrl(params.returnUrl)} />
  );
}
