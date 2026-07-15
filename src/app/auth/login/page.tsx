"use client"

import { AuthCard } from "@/features/shared/auth/components/AuthCard";
import HydrationSafe from "@/components/shared/HydrationSafe";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-slate-50/50 p-4" dir="rtl">
      <HydrationSafe>
        {/* رندر کارت با فعال بودن پیش‌فرض تب ورود */}
        <AuthCard defaultTab="login" />
      </HydrationSafe>
    </main>
  );
}