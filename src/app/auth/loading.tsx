import { AuthCardRouteFallback } from '@/features/shared/auth/components/AuthCardRouteFallback';

/** Auth route gap — plain canvas, no skeleton bones (rule 80). */
export default function AuthLoading() {
  return (
    <div
      className="kv-blueprint-bg flex min-h-dvh w-full items-center justify-center p-kv-inset"
      dir="rtl"
      aria-busy="true"
    >
      <AuthCardRouteFallback />
    </div>
  );
}
