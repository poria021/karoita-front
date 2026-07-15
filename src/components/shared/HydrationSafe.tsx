'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useUserStore } from '@/store/useUserStore'; //  استور کاربر

export default function HydrationSafe({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // ۱.  استور کاربر را از لوکال بازخوانی و ری‌هیدرات می‌کنیم
    useUserStore.persist.rehydrate();
    
    // ۲. پرچم لود کلاینت 
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <>{children}</>;
}