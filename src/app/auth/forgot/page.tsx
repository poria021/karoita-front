import { AuthCard } from '@/features/shared/auth/components/AuthCard';
import { AuthPageShell } from '@/features/shared/auth/components/AuthPageShell';

export default function ForgotPage() {
  return (
    <AuthPageShell>
      <AuthCard surface="forgot" />
    </AuthPageShell>
  );
}
