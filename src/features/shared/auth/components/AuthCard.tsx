'use client';

import { useState } from 'react';

import {
  AppTabs,
  AppTabsContent,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { KvTypography } from '@/components/shared/KvTypography';
import {
  kvProductFooterBorderClassName,
} from '@/components/shared/shell/shellChrome';
import { cn } from '@/lib/utils';

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
      <div className="px-kv-inset py-kv-group sm:px-kv-page sm:py-kv-section">
        <AuthLogo subtitle="سامانه هوشمند کارورزی و کارآموزی" />

        {isForgotMode ? (
          <LoginForm login={login} />
        ) : (
          <AppTabs
            fullWidth
            activeTone="surface"
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

            {/* 
              فقط tab فعال در DOM نگه داشته می‌شه تا:
              1. ID های form field ها duplicate نشن (مرورگر warning نده)
              2. حافظه و re-render کاهش پیدا کنه
              
              unmountOnHide روی TabsContent از Radix این کار رو می‌کنه.
              وقتی tab تغییر می‌کنه، form state ری‌ست می‌شه — این رفتار مطلوبه
              چون کاربر نباید اطلاعات tab دیگه رو ببینه.
            */}
            <AppTabsContent
              value="register"
              className="pb-kv-group duration-300 animate-in fade-in"
              // فقط tab فعال mount بشه — جلوگیری از duplicate form field IDs
              forceMount={activeTab === 'register' ? true : undefined}
              hidden={activeTab !== 'register'}
            >
              {activeTab === 'register' && <RegisterForm />}
            </AppTabsContent>
            <AppTabsContent
              value="login"
              className="pb-kv-group duration-300 animate-in fade-in"
              forceMount={activeTab === 'login' ? true : undefined}
              hidden={activeTab !== 'login'}
            >
              {activeTab === 'login' && <LoginForm login={login} />}
            </AppTabsContent>
          </AppTabs>
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
