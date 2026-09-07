'use client';

import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';
import { useAuthTransitionPhase } from '@/store/useAuthTransitionPhase';

/**
 * لودر تمام‌ویوپورت فقط برای مرز احراز (ورود→داشبورد، خروج→مارکتینگ).
 * برای تعویض ماژول/تب داخل داشبورد استفاده نشود.
 *
 * روتر را نخوان — `usePathname` هنگام تعویض سگمنت `Next` این `overlay` را `suspend`
 * می‌کند (`fallback` تهی) و شل خالی چشمک می‌زند. مقصد `AuthTransitionPaintRelease` را صدا می‌زند.
 */
export function AuthTransitionOverlay() {
  const phase = useAuthTransitionPhase();

  if (phase === 'idle') return null;

  return (
    <div className="kv-blueprint-bg fixed inset-0 z-[200]">
      <KvBrandLinearLoader
        className="h-full min-h-dvh bg-transparent"
        label={
          phase === 'leaving'
            ? 'در حال خروج از حساب کاربری…'
            : 'لطفا منتظر بمانید…'
        }
      />
    </div>
  );
}
