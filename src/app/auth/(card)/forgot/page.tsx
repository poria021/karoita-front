import { AuthCard } from '@/features/shared/auth/components/AuthCard';
import { DOCUMENT_TITLE, privatePageMetadata } from '@/lib/document-title';
import { parseSafeReturnUrl } from '@/lib/return-url';

export const metadata = privatePageMetadata(DOCUMENT_TITLE.forgotPassword);

interface ForgotPageProps {
  searchParams: Promise<{ returnUrl?: string }>;
}

export default async function ForgotPage({ searchParams }: ForgotPageProps) {
  const params = await searchParams;

  return (
    <AuthCard surface="forgot" returnUrl={parseSafeReturnUrl(params.returnUrl)} />
  );
}
