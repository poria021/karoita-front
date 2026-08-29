import { AuthCardRouteFallback } from '@/features/shared/auth/components/AuthCardRouteFallback';

/** فقط محتوای کارت؛ layout (لوگو/فوتر/پس‌زمینه) ثابت می‌ماند. */
export default function AuthCardGroupLoading() {
  return <AuthCardRouteFallback />;
}
