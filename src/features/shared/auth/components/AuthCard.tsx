'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

import {
  AppTabs,
  AppTabsContent,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';

import { useLoginForm, type LoginMode } from '../hooks/useLoginForm';
import {
  loginHref,
  registerHref,
  type AuthCardSurface,
} from '../lib/authHrefs';
import { AuthFormStage } from './AuthFormStage';
import { ForgotForm } from './ForgotForm';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthCardProps {
  surface: AuthCardSurface;
  returnUrl?: string | null;
  onSurfaceIntent?: (surface: AuthCardSurface) => void;
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
  onSurfaceIntent,
  children,
}: {
  surface: 'login' | 'register';
  loginMode?: LoginMode;
  returnUrl?: string | null;
  onSurfaceIntent?: (surface: AuthCardSurface) => void;
  children: ReactNode;
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
            onClick={() => onSurfaceIntent?.('register')}
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
            onClick={() => onSurfaceIntent?.('login')}
          >
            {loginTabLabel(surface, loginMode)}
          </Link>
        </AppTabsTrigger>
      </AppTabsList>
      {/*
        Radix برای هر تریگر aria-controls می‌سازد؛ بدون TabsContent با همان value
        آن id در DOM نیست و axe خطای aria-valid-attr-value می‌دهد.
        forceMount پنل غیرفعال را هم نگه می‌دارد تا تریگر غیرفعال هم ارجاع معتبر داشته باشد.
      */}
      <AppTabsContent value="register" forceMount className="mt-0">
        {surface === 'register' ? children : null}
      </AppTabsContent>
      <AppTabsContent value="login" forceMount className="mt-0">
        {surface === 'login' ? children : null}
      </AppTabsContent>
    </AppTabs>
  );
}

function LoginPanel({
  returnUrl,
  onSurfaceIntent,
}: {
  returnUrl?: string | null;
  onSurfaceIntent?: (surface: AuthCardSurface) => void;
}) {
  const login = useLoginForm(returnUrl ?? null);
  return (
    <AuthSurfaceTabs
      surface="login"
      loginMode={login.mode}
      returnUrl={returnUrl}
      onSurfaceIntent={onSurfaceIntent}
    >
      <AuthFormStage stageKey={`login-${login.mode}`}>
        <LoginForm login={login} />
      </AuthFormStage>
    </AuthSurfaceTabs>
  );
}

function RegisterPanel({
  returnUrl,
  onSurfaceIntent,
}: {
  returnUrl?: string | null;
  onSurfaceIntent?: (surface: AuthCardSurface) => void;
}) {
  return (
    <AuthSurfaceTabs
      surface="register"
      returnUrl={returnUrl}
      onSurfaceIntent={onSurfaceIntent}
    >
      <AuthFormStage stageKey="register">
        <RegisterForm />
      </AuthFormStage>
    </AuthSurfaceTabs>
  );
}

export function AuthCard({
  surface,
  returnUrl = null,
  onSurfaceIntent,
}: AuthCardProps) {
  if (surface === 'forgot') {
    return (
      <AuthFormStage stageKey="forgot">
        <ForgotForm returnUrl={returnUrl} />
      </AuthFormStage>
    );
  }
  if (surface === 'register') {
    return (
      <RegisterPanel returnUrl={returnUrl} onSurfaceIntent={onSurfaceIntent} />
    );
  }
  return <LoginPanel returnUrl={returnUrl} onSurfaceIntent={onSurfaceIntent} />;
}
