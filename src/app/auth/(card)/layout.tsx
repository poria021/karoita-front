import { type ReactNode } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { kvProductFooterBorderClassName } from '@/components/shared/shell/shellChrome';
import { AuthLogo } from '@/features/shared/auth/components/AuthLogo';
import { cn } from '@/lib/utils';

/**
 * Shared chrome for the /auth/login, /auth/register, /auth/forgot routes.
 *
 * `returnUrl` از searchParams در pageهای سروری خوانده می‌شود تا این layout
 * نیاز به Suspense نداشته باشد — وگرنه لوگو/فوتر زودتر از فرم دیده می‌شوند.
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

          {children}

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
