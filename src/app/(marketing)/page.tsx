import Link from 'next/link';
import { ArrowLeft, GraduationCap, LayoutDashboard, ShieldCheck } from 'lucide-react';

import { RouteService } from '@/services/route.service';

/**
 * Public marketing landing page (rule 60, #10).
 * Kept as an RSC — no client state required.
 */
export default function MarketingHomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-slate-50/50 p-4 sm:p-8" dir="rtl">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/10">
            <GraduationCap className="size-5" aria-hidden="true" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-brand-500">کارویتا</span>
        </div>

        <Link
          href={RouteService.auth.login()}
          prefetch={false}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          <span>ورود به سامانه</span>
          <ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </header>

      <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center space-y-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
          <ShieldCheck className="size-8" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
            سامانه جامع آموزش نظری و مهارتی کارویتا
          </h1>
          <p className="text-xs font-bold leading-relaxed text-slate-500 sm:text-sm">
            پورتال یکپارچه و هوشمند مدیریت دوره‌های کارورزی دانشگاهی و کارآموزی مهارتی کشور.
          </p>
        </div>

        <Link
          href={RouteService.auth.login()}
          prefetch={false}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-3 text-xs font-black text-white shadow-lg shadow-brand-500/20 transition-all hover:opacity-95"
        >
          <LayoutDashboard className="size-4" aria-hidden="true" />
          <span>ورود به میز کار کاربری</span>
        </Link>
      </main>

      <footer className="mx-auto w-full max-w-6xl border-t border-slate-100 pt-4 text-center text-[10px] font-bold text-slate-400">
        <p>تمام حقوق مادی و معنوی متعلق به سامانه آموزشی مهارتی کارویتا می‌باشد.</p>
      </footer>
    </div>
  );
}
