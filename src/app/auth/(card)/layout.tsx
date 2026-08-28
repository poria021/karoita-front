import { Suspense, type ReactNode } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { kvProductFooterBorderClassName } from '@/components/shared/shell/shellChrome';
import { AuthCardRouteFallback } from '@/features/shared/auth/components/AuthCardRouteFallback';
import { AuthLogo } from '@/features/shared/auth/components/AuthLogo';
import { cn } from '@/lib/utils';

/**
 * Shared chrome for the /auth/login, /auth/register, /auth/forgot routes.
 *
 * These three routes used to each render their own copy of the outer card
 * (logo, box, footer) via <AuthPageShell>/<AuthCard>. Since they're separate
 * route segments, switching between them fully unmounted and remounted that
 * whole tree — the logo/box/footer blinked out and back in, and because the
 * page was vertically centered, a taller/shorter form also shifted the
 * card's position on screen. Together this read as the page "jumping".
 *
 * This layout persists across navigation between sibling routes in the same
 * group, so the logo, card box, and footer now stay mounted and only
 * `{children}` (the tabs + step content, the only part that needs
 * useSearchParams/Suspense) is swapped. The outer <main> is top-aligned
 * instead of vertically centered, so a taller form no longer repositions
 * the whole card.
 */
export default function AuthCardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main
      className="kv-blueprint-bg flex min-h-dvh w-full justify-center items-center p-kv-inset"
      dir="rtl"
    >
      <div className="kv-auth-enter w-full max-w-[450px] overflow-hidden rounded-kv-card border border-kv-border/80 bg-kv-surface shadow-kv-overlay">
        <div className="px-kv-inset py-kv-group sm:px-kv-page sm:py-kv-section">
          <AuthLogo subtitle="سامانه هوشمند کارورزی و کارآموزی" />

          <Suspense fallback={<AuthCardRouteFallback />}>{children}</Suspense>

          <div
            className={cn(
              'mt-kv-section pt-kv-stack text-center',
              kvProductFooterBorderClassName
            )}
          >
            <KvTypography variant="overline" tone="disabled" align="center">
              کارویتا - سامانه هوشمند کارورزی و کارآموزی
            </KvTypography>
          </div>
        </div>
      </div>
    </main>
  );
}
