import { AuthCard } from '@/features/shared/auth/components/AuthCard';
import { AuthPageShell } from '@/features/shared/auth/components/AuthPageShell';

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <AuthCard surface="register" />
    </AuthPageShell>
  );
}
