import { AuthCard } from '@/features/shared/auth/components/AuthCard';
import HydrationSafe from '@/components/shared/HydrationSafe';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-50/50 p-4" dir="rtl">
      <HydrationSafe>
        <AuthCard defaultTab="login" />
      </HydrationSafe>
    </main>
  );
}
