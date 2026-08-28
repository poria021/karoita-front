'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { KvTypography } from '@/components/shared/KvTypography';
import {
  kvProductFooterBorderClassName,
} from '@/components/shared/shell/shellChrome';
import { RETURN_URL_PARAM } from '@/lib/return-url';
import { cn } from '@/lib/utils';

import { useLoginForm, type LoginMode } from '../hooks/useLoginForm';
import {
  loginHref,
  registerHref,
  type AuthCardSurface,
} from '../lib/authHrefs';
import { AuthLogo } from './AuthLogo';
import { ForgotForm } from './ForgotForm';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthCardProps {
  surface: AuthCardSurface;
}

function loginTabLabel(surface: AuthCardSurface, loginMode: LoginMode) {
  if (surface !== 'login') return 'ورود';
  if (loginMode === 'otp') return 'ورود با رمز یکبار مصرف';
  return 'ورود با رمز عبور';
}

function AuthSurfaceTabs({
  surface,
  loginMode = 'password',
}: {
  surface: 'login' | 'register';
  loginMode?: LoginMode;
}) {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get(RETURN_URL_PARAM);

  return (
    <AppTabs fullWidth activeTone="surface" value={surface} className="gap-kv-group">
      <AppTabsList>
        <AppTabsTrigger value="register" asChild>
          <Link
            href={registerHref({ returnUrl })}
            replace
            scroll={false}
            prefetch={false}
          >
            ثبت نام
          </Link>
        </AppTabsTrigger>
        <AppTabsTrigger value="login" asChild>
          <Link
            href={loginHref({ returnUrl })}
            replace
            scroll={false}
            prefetch={false}
          >
            {loginTabLabel(surface, loginMode)}
          </Link>
        </AppTabsTrigger>
      </AppTabsList>
    </AppTabs>
  );
}

function LoginPanel() {
  const login = useLoginForm();
  return (
    <div className="flex flex-col gap-kv-group">
      <AuthSurfaceTabs surface="login" loginMode={login.mode} />
      <LoginForm login={login} />
    </div>
  );
}

function RegisterPanel() {
  return (
    <div className="flex flex-col gap-kv-group">
      <AuthSurfaceTabs surface="register" />
      <RegisterForm />
    </div>
  );
}

export function AuthCard({ surface }: AuthCardProps) {
  return (
    <div className="kv-auth-enter mt-kv-section w-full max-w-[450px] overflow-hidden rounded-kv-card border border-kv-border/80 bg-kv-surface shadow-kv-overlay">
      <div className="px-kv-inset py-kv-group sm:px-kv-page sm:py-kv-section">
        <AuthLogo subtitle="سامانه هوشمند کارورزی و کارآموزی" />

        {surface === 'forgot' ? (
          <ForgotForm />
        ) : surface === 'register' ? (
          <RegisterPanel />
        ) : (
          <LoginPanel />
        )}

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
