'use client';

import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';
import { useAuthTransitionPhase } from '@/store/authTransition';

/**
 * Full-viewport brand loader for auth-boundary transitions only
 * (login → dashboard, logout → marketing). Never used for in-dashboard
 * module or tab switches.
 *
 * Does not read the router — `usePathname` during Next.js segment swaps
 * can suspend this overlay (fallback null) and flash the empty dashboard
 * shell. Destination layouts call `AuthTransitionPaintRelease` instead.
 */
export function AuthTransitionOverlay() {
  const phase = useAuthTransitionPhase();

  if (phase === 'idle') return null;

  return (
    <div className="kv-brand-atmosphere kv-blueprint-bg fixed inset-0 z-[200]">
      <KvBrandLinearLoader
        fullViewport
        className="h-full min-h-dvh"
        label={
          phase === 'leaving'
            ? 'در حال خروج از حساب کاربری…'
            : 'لطفا منتظر بمانید…'
        }
      />
    </div>
  );
}
