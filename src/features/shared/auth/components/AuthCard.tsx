'use client';

import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useLoginForm } from '../hooks/useLoginForm';
import { AuthLogo } from './AuthLogo';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

const ACTIVE_TAB_STYLES =
  'rounded-md text-xs font-bold text-slate-500 data-[state=active]:bg-brand-500 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_10px_rgba(16,78,198,0.15)]';
  interface AuthCardProps {
    defaultTab?: 'register' | 'login';
  }

type AuthCardTab = 'register' | 'login';


  

/** Farsi label for the login tab trigger, matching the active login sub-mode from `useLoginForm`. */
function getLoginTabLabel(activeTab: AuthCardTab, loginMode: 'password' | 'otp' | 'forgot'): string {
  if (activeTab !== 'login') return 'ورود';
  if (loginMode === 'otp') return 'ورود با رمز یکبار مصرف';
  return 'ورود با رمز عبور';
}

export function AuthCard({ defaultTab = 'register' }: AuthCardProps) {
  const [activeTab, setActiveTab] = useState<AuthCardTab>(defaultTab);
  const login = useLoginForm();

  // بررسی این که آیا در حالت فراموشی رمز عبور هستیم یا خیر
  const isForgotMode = login.mode === 'forgot';

  return (
    <div className="mt-8 w-full max-w-[450px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md">
      <div className="p-6 sm:p-8">
        {/* تغییر خودکار زیرعنوان هدر بر اساس حالت بازیابی رمز */}
        <AuthLogo subtitle={isForgotMode ? "بازیابی و تنظیم مجدد رمز عبور" : "سامانه هوشمند کارورزی و کارآموزی"} />

        {isForgotMode ? (
          /* در حالت فراموشی رمز، تب‌ها کلاً رندر نمی‌شوند و مستقیم فرم بازیابی لود می‌شود */
          <LoginForm login={login} />
        ) : (
          /* لایوت پیش‌فرض تب‌ها در زمان لاگین و ثبت‌نام عادی */
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AuthCardTab)} className="gap-4">
            <TabsList className="w-full gap-1 rounded-lg border border-slate-200 bg-slate-100 p-[3px]">
              <TabsTrigger value="register" className={ACTIVE_TAB_STYLES}>
                ثبت نام
              </TabsTrigger>
              <TabsTrigger value="login" className={ACTIVE_TAB_STYLES}>
                {getLoginTabLabel(activeTab, login.mode)}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
            <TabsContent value="login">
              <LoginForm login={login} />
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-8 border-t border-slate-100/80 pt-5 text-center">
          <p className="text-[10px] font-bold text-slate-400">کارویتا - سامانه هوشمند کارورزی و کارآموزی</p>
        </div>
      </div>
    </div>
  );
}