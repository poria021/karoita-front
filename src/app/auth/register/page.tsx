"use client"

import { AuthCard } from "@/features/shared/auth/components/AuthCard";
import HydrationSafe from "@/components/shared/HydrationSafe";

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-slate-50/50 p-4" dir="rtl">
      <HydrationSafe>
        {/* رندر کارت با فعال بودن پیش‌فرض تب ثبت‌نام */}
        <AuthCard defaultTab="register" />
      </HydrationSafe>
    </main>
  );
}