'use client';

import { useState } from 'react';

import {
  AppTabs,
  AppTabsContent,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { KvTypography } from '@/components/shared/KvTypography';

import { useLoginForm } from '../hooks/useLoginForm';
import { AuthLogo } from './AuthLogo';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthCardProps {
  defaultTab?: 'register' | 'login';
}

type AuthCardTab = 'register' | 'login';

/** Farsi label for the login tab trigger, matching the active login sub-mode from `useLoginForm`. */
function getLoginTabLabel(
  activeTab: AuthCardTab,
  loginMode: 'password' | 'otp' | 'forgot'
): string {
  if (activeTab !== 'login') return 'ورود';
  if (loginMode === 'otp') return 'ورود با رمز یکبار مصرف';
  return 'ورود با رمز عبور';
}

export function AuthCard({ defaultTab = 'register' }: AuthCardProps) {
  const [activeTab, setActiveTab] = useState<AuthCardTab>(defaultTab);
  const login = useLoginForm();

  const isForgotMode = login.mode === 'forgot';

  return (
    <div className="mt-8 w-full max-w-[450px] overflow-hidden rounded-kv-card border border-slate-200/80 bg-white shadow-md">
      <div className="p-kv-inset sm:p-kv-page">
        <AuthLogo
          subtitle={
            isForgotMode
              ? 'بازیابی و تنظیم مجدد رمز عبور'
              : 'سامانه هوشمند کارورزی و کارآموزی'
          }
        />

        {isForgotMode ? (
          <LoginForm login={login} />
        ) : (
          <AppTabs
            model="capsule"
            size="sm"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as AuthCardTab)}
            className="gap-kv-group"
          >
            <AppTabsList>
              <AppTabsTrigger value="register">ثبت نام</AppTabsTrigger>
              <AppTabsTrigger value="login">
                {getLoginTabLabel(activeTab, login.mode)}
              </AppTabsTrigger>
            </AppTabsList>

            <AppTabsContent value="register">
              <RegisterForm />
            </AppTabsContent>
            <AppTabsContent value="login">
              <LoginForm login={login} />
            </AppTabsContent>
          </AppTabs>
        )}

        <div className="mt-8 border-t border-slate-100/80 pt-kv-stack text-center">
          <KvTypography variant="overline" tone="muted" align="center">
            کارویتا - سامانه هوشمند کارورزی و کارآموزی
          </KvTypography>
        </div>
      </div>
    </div>
  );
}
