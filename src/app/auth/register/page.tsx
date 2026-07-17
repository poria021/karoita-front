import { AuthCard } from '@/features/shared/auth/components/AuthCard';
import HydrationSafe from '@/components/shared/HydrationSafe';

export default function RegisterPage() {
  return (
    <main
      className="kv-brand-atmosphere flex min-h-dvh w-full items-center justify-center p-kv-inset"
      dir="rtl"
    >
      <HydrationSafe>
        <AuthCard defaultTab="register" />
      </HydrationSafe>
    </main>
  );
}
