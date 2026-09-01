'use client';

import { Suspense, useLayoutEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { KvTypography } from '@/components/shared/KvTypography';
import { kvProductFooterBorderClassName } from '@/components/shared/shell/shellChrome';
import { readReturnUrlParam } from '@/lib/return-url';
import { cn } from '@/lib/utils';

import {
  authCardSurfaceFromPathname,
  type AuthCardSurface,
} from '../lib/authHrefs';
import { AuthCard } from './AuthCard';
import { AuthLogo } from './AuthLogo';

/**
 * فقط همین برگ useSearchParams دارد. اگر روی خود میزبان باشد، کل کارت
 * suspend می‌شود و HTML اولیه پوستهٔ خالی (لوگو + فوتر) را استریم می‌کند.
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
 * کارت ورود روی layout مشترک login/register/forgot می‌ماند تا عوض شدن تب
 * فرم را خالی نکند. لوگو و فوتر هم اینجاست تا با فرم یک HTML واحد باشند.
 */
export function AuthCardHost() {
  const pathname = usePathname();
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
    <div className="kv-auth-enter w-full max-w-[450px] overflow-hidden rounded-kv-card border border-kv-border/80 bg-kv-surface shadow-kv-overlay">
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
  );
}
