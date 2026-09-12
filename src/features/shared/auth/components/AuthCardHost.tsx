'use client';

import { Suspense, useLayoutEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { KvTypography } from '@/components/shared/KvTypography';
import { kvProductFooterBorderClassName } from '@/components/shared/shell/shellChrome';
import { usePwaStandalone } from '@/hooks/usePwaInstall';
import { readReturnUrlParam } from '@/lib/return-url';
import { cn } from '@/lib/utils';

import {
  authCardSurfaceFromPathname,
  type AuthCardSurface,
} from '../lib/authHrefs';
import { AuthCard } from './AuthCard';
import { AuthLogo } from './AuthLogo';
import { AuthPwaBackButton } from './AuthPwaBackButton';

/**
 * Read the return URL only from the current search params so the shell can remain stable
 * while the auth tab switches.
 */
function AuthReturnUrlSync({
  onReturnUrl,
}: {
  onReturnUrl: (value: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const returnUrl = readReturnUrlParam(searchParams);

  useLayoutEffect(() => {
    onReturnUrl(returnUrl);
  }, [onReturnUrl, returnUrl]);

  return null;
}

/**
 * Keep the auth card mounted across login/register/forgot tabs so the form state is stable.
 */
export function AuthCardHost() {
  const pathname = usePathname();
  const isPwa = usePwaStandalone();
  const pathSurface = authCardSurfaceFromPathname(pathname);
  const [pendingSurface, setPendingSurface] = useState<AuthCardSurface | null>(
    null
  );
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  // تا وقتی pathname به تب کلیک‌شده برسد، همان سطح را نشان بده؛ بعد pending را خالی کن.
  if (pendingSurface !== null && pendingSurface === pathSurface) {
    setPendingSurface(null);
  }

  const surface = pendingSurface ?? pathSurface;

  return (
    <div
      className={cn(
        'relative w-full',
        isPwa
          ? 'max-w-[calc(450px+2.25rem+var(--spacing-kv-stack))] pe-[calc(2.25rem+var(--spacing-kv-stack))]'
          : 'max-w-[450px]'
      )}
    >
      {isPwa ? (
        <div className="absolute top-[calc(var(--spacing-kv-group)+var(--spacing-kv-inset))] start-0 z-10 sm:top-[calc(var(--spacing-kv-section)+var(--spacing-kv-inset))]">
          <AuthPwaBackButton />
        </div>
      ) : null}
      <div className="kv-auth-enter w-full overflow-hidden rounded-kv-card border border-kv-border/80 bg-kv-surface shadow-kv-overlay">
        {/* خارج از ستون لوگو/فرم تا pending بودن searchParams بین آن‌ها حفره نسازد. */}
        <Suspense fallback={null}>
          <AuthReturnUrlSync onReturnUrl={setReturnUrl} />
        </Suspense>
        <div className="px-kv-inset py-kv-group sm:px-kv-page sm:py-kv-section">
          <AuthLogo subtitle="سامانه هوشمند کارورزی و کارآموزی" />
          <AuthCard
            surface={surface}
            returnUrl={returnUrl}
            onSurfaceIntent={setPendingSurface}
          />

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
    </div>
  );
}
