'use client';

import Link from 'next/link';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';

import { useLoginForm, type LoginMode } from '../hooks/useLoginForm';
import {
  loginHref,
  registerHref,
  type AuthCardSurface,
} from '../lib/authHrefs';
import { ForgotForm } from './ForgotForm';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthCardProps {
  surface: AuthCardSurface;
  returnUrl?: string | null;
}

function loginTabLabel(surface: AuthCardSurface, loginMode: LoginMode) {
  if (surface !== 'login') return 'ورود';
  if (loginMode === 'otp') return 'ورود با رمز یکبار مصرف';
  return 'ورود با رمز عبور';
}

function AuthSurfaceTabs({
  surface,
  loginMode = 'password',
  returnUrl,
}: {
  surface: 'login' | 'register';
  loginMode?: LoginMode;
  returnUrl?: string | null;
}) {
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

function LoginPanel({ returnUrl }: { returnUrl?: string | null }) {
  const login = useLoginForm(returnUrl ?? null);
  return (
    <div className="flex flex-col gap-kv-group">
      <AuthSurfaceTabs surface="login" loginMode={login.mode} returnUrl={returnUrl} />
      <LoginForm login={login} />
    </div>
  );
}

function RegisterPanel({ returnUrl }: { returnUrl?: string | null }) {
  return (
    <div className="flex flex-col gap-kv-group">
      <AuthSurfaceTabs surface="register" returnUrl={returnUrl} />
      <RegisterForm />
    </div>
  );
}

export function AuthCard({ surface, returnUrl = null }: AuthCardProps) {
  if (surface === 'forgot') return <ForgotForm returnUrl={returnUrl} />;
  if (surface === 'register') return <RegisterPanel returnUrl={returnUrl} />;
  return <LoginPanel returnUrl={returnUrl} />;
}
