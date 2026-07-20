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
    <div className="kv-auth-enter mt-kv-section w-full max-w-[450px] overflow-hidden rounded-kv-card border border-kv-border/80 bg-kv-surface shadow-kv-overlay">
      <div className="p-kv-inset sm:p-kv-page">
        <AuthLogo subtitle="سامانه هوشمند کارورزی و کارآموزی" />

        {isForgotMode ? (
          <LoginForm login={login} />
        ) : (
          <AppTabs
            fullWidth
            activeTone="surface"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as AuthCardTab)}
            className="gap-kv-stack"
          >
            <AppTabsList>
              <AppTabsTrigger value="register">ثبت نام</AppTabsTrigger>
              <AppTabsTrigger value="login">
                {getLoginTabLabel(activeTab, login.mode)}
              </AppTabsTrigger>
            </AppTabsList>

            <AppTabsContent value="register" className="mt-0 duration-300 animate-in fade-in">
              <RegisterForm />
            </AppTabsContent>
            <AppTabsContent value="login" className="mt-0 duration-300 animate-in fade-in">
              <LoginForm login={login} />
            </AppTabsContent>
          </AppTabs>
        )}

        <div className="mt-kv-section border-t border-kv-border-muted/80 pt-kv-stack text-center">
          <KvTypography variant="overline" tone="muted" align="center">
            کارویتا - سامانه هوشمند کارورزی و کارآموزی
          </KvTypography>
        </div>
      </div>
    </div>
  );
}
