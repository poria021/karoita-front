'use client';

import { useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { faIcons } from '@/utils/iconMap';

type RoleTab = 'hq' | 'region' | 'exec';

export function MarketingBenefitsSection() {
  const [roleTab, setRoleTab] = useState<RoleTab>('hq');

  return (
    <section className="relative">
      <div className="relative z-10 mx-auto max-w-7xl px-kv-inset sm:px-kv-page">
        <div className="mx-auto mb-8 max-w-3xl space-y-3 text-center md:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-kv-border-muted bg-kv-surface/80 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-kv-text-secondary shadow-sm">
            <span className="size-1.5 rounded-full bg-kv-brand" /> ارزش آفرینی
            نقش محور
          </span>
          <h2 className="text-2xl font-black tracking-tight text-kv-text sm:text-3xl">
            ارزش‌های عملیاتی در یک نگاه
          </h2>
          <p className="text-xs font-bold leading-relaxed text-kv-text-muted sm:text-sm">
            نقش کاربری خود را انتخاب کنید تا امکانات اختصاصی حوزه خود را مشاهده
            نمایید
          </p>
        </div>

        <div className="mb-10 flex w-full flex-wrap items-center justify-center gap-2 px-2">
          <button
            onClick={() => setRoleTab('hq')}
            className={`flex-1 text-center rounded-xl px-3 py-2.5 text-[11px] font-black transition-all sm:flex-initial sm:px-5 sm:text-xs ${
              roleTab === 'hq'
                ? 'bg-kv-brand text-kv-brand-fg shadow-md'
                : 'bg-kv-surface-subtle text-kv-text-secondary hover:bg-kv-surface-muted'
            }`}
          >
            <FaIcon
              icon={faIcons.buildingColumns}
              size="sm"
              className="ml-1.5"
            />{' '}
            سازمان مرکزی و دانشگاه‌ها
          </button>
          <button
            onClick={() => setRoleTab('region')}
            className={`flex-1 text-center rounded-xl px-3 py-2.5 text-[11px] font-black transition-all sm:flex-initial sm:px-5 sm:text-xs ${
              roleTab === 'region'
                ? 'bg-kv-success text-kv-success-fg shadow-md'
                : 'bg-kv-surface-subtle text-kv-text-secondary hover:bg-kv-surface-muted'
            }`}
          >
            <FaIcon icon={faIcons.school} size="sm" className="ml-1.5" /> ادارات
            مناطق و مدارس
          </button>
          <button
            onClick={() => setRoleTab('exec')}
            className={`w-full text-center rounded-xl px-3 py-2.5 text-[11px] font-black transition-all sm:w-auto sm:px-5 sm:text-xs ${
              roleTab === 'exec'
                ? 'bg-kv-violet text-kv-violet-fg shadow-md'
                : 'bg-kv-surface-subtle text-kv-text-secondary hover:bg-kv-surface-muted'
            }`}
          >
            <FaIcon icon={faIcons.chalkboardUser} size="sm" className="ml-1.5" />{' '}
            اساتید، مربیان و دانشجویان
          </button>
        </div>

        <div className="rounded-3xl border border-kv-border-muted bg-kv-surface-subtle p-6 shadow-sm sm:p-10">
          {roleTab === 'hq' && (
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="space-y-4 text-right lg:col-span-6">
                <span className="inline-block rounded-md bg-kv-brand-soft px-3 py-1 text-[10px] font-extrabold text-kv-brand-soft-fg">
                  مدیریت کلان و سیاست‌گذاری
                </span>
                <h3 className="text-xl font-black text-kv-text">
                  کنترل کشوری و یکپارچه‌سازی کامل پردیس‌ها
                </h3>
                <ul className="space-y-3 pt-2 text-xs font-bold text-kv-text-secondary">
                  <li className="flex items-start gap-2.5">
                    <FaIcon
                      icon={faIcons.circleCheck}
                      className="mt-0.5 shrink-0 text-kv-brand"
                      size="sm"
                    />
                    <span>ارائه نیم سال تحصیلی به صورت ترمی و پودمانی</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <FaIcon
                      icon={faIcons.circleCheck}
                      className="mt-0.5 shrink-0 text-kv-brand"
                      size="sm"
                    />
                    <span>
                      حذف کامل بایگانی کاغذی و صرفه‌جویی ۱۰۰٪ در هزینه‌های تکثیر
                      اسناد
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <FaIcon
                      icon={faIcons.circleCheck}
                      className="mt-0.5 shrink-0 text-kv-brand"
                      size="sm"
                    />
                    <span>
                      گزارش‌گیری تحلیلی زنده از درصد تکمیل، معدل کل استان‌ و
                      دانشکده ها
                    </span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3 rounded-2xl border border-kv-border-muted bg-kv-surface p-5 shadow-sm lg:col-span-6">
                <div className="flex items-center justify-between border-b border-kv-border-muted pb-2 text-xs font-black text-kv-text">
                  <span>کنسول مدیریت سازمان مرکزی</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-right">
                  <div className="rounded-xl border border-kv-brand-border bg-kv-brand-soft/50 p-3">
                    <span className="block text-[10px] font-extrabold text-kv-text-subtle">
                      پردیس‌های فعال
                    </span>
                    <span className="mt-0.5 block text-base font-black text-kv-brand-soft-fg">
                      ۳۱ در استان
                    </span>
                  </div>
                  <div className="rounded-xl border border-kv-success-border bg-kv-success-soft/50 p-3">
                    <span className="block text-[10px] font-extrabold text-kv-text-subtle">
                      نرخ تکمیل ارزیابی
                    </span>
                    <span className="mt-0.5 block text-base font-black text-kv-success-soft-fg">
                      ۹۶.۴٪
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {roleTab === 'region' && (
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="space-y-4 text-right lg:col-span-6">
                <span className="inline-block rounded-md bg-kv-success-soft px-3 py-1 text-[10px] font-extrabold text-kv-success-soft-fg">
                  نظارت میدانی و پذیرش مدارس
                </span>
                <h3 className="text-xl font-black text-kv-text">
                  ساماندهی هوشمند معلمان راهنما و مدارس
                </h3>
                <ul className="space-y-3 pt-2 text-xs font-bold text-kv-text-secondary">
                  <li className="flex items-start gap-2.5">
                    <FaIcon
                      icon={faIcons.circleCheck}
                      className="mt-0.5 shrink-0 text-kv-success"
                      size="sm"
                    />
                    <span>مشاهده نمره عملکرد مدارس در روند ارزیابی‌ها</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <FaIcon
                      icon={faIcons.circleCheck}
                      className="mt-0.5 shrink-0 text-kv-success"
                      size="sm"
                    />
                    <span>
                      امکان گزارش گیری و مقایسه عملکرد چند مدرسه یا معلمان مدارس
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <FaIcon
                      icon={faIcons.circleCheck}
                      className="mt-0.5 shrink-0 text-kv-success"
                      size="sm"
                    />
                    <span>
                      گزارش‌گیری ویژه آموزش و پرورش منطقه از توزیع ظرفیت مدارس
                      تابعه
                    </span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3 rounded-2xl border border-kv-border-muted bg-kv-surface p-5 shadow-sm lg:col-span-6">
                <div className="flex items-center justify-between border-b border-kv-border-muted pb-2 text-xs font-black text-kv-text">
                  <span>پنل مانیتورینگ مدارس منطقه</span>
                </div>
                <div className="space-y-2 rounded-xl bg-kv-surface-subtle p-3 text-xs font-bold text-kv-text-secondary">
                  <div className="flex items-center justify-between">
                    <span>مدارس همکار فعال:</span>
                    <span className="font-black text-kv-text">۴۸ مدرسه</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ارزیابی معلمان راهنما:</span>
                    <span className="font-black text-kv-success">در حال انجام</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {roleTab === 'exec' && (
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="space-y-4 text-right lg:col-span-6">
                <span className="inline-block rounded-md bg-kv-violet-soft px-3 py-1 text-[10px] font-extrabold text-kv-violet-soft-fg">
                  اجرایی، آموزشی و مهارتی
                </span>
                <h3 className="text-xl font-black text-kv-text">
                  فرآیند آسان ارسال، بازخورد و تمدید مهلت
                </h3>
                <ul className="space-y-3 pt-2 text-xs font-bold text-kv-text-secondary">
                  <li className="flex items-start gap-2.5">
                    <FaIcon
                      icon={faIcons.circleCheck}
                      className="mt-0.5 shrink-0 text-kv-violet"
                      size="sm"
                    />
                    <span>
                      ارسال مستندات، ویدیو یا طرح‌درس توسط کارورز به صورت کاملا
                      انلاین
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <FaIcon
                      icon={faIcons.circleCheck}
                      className="mt-0.5 shrink-0 text-kv-violet"
                      size="sm"
                    />
                    <span>
                      صدور کارنامه مهارتی به صورت آنی با قابلیت دانلود به صورت
                      PDF
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <FaIcon
                      icon={faIcons.circleCheck}
                      className="mt-0.5 shrink-0 text-kv-violet"
                      size="sm"
                    />
                    <span>
                      امکان تمدید هفته یک هفته به صورت گروهی در صورت منقضی شدن
                      زمان ارسال گزارش هفتگی
                    </span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3 rounded-2xl border border-kv-border-muted bg-kv-surface p-5 shadow-sm lg:col-span-6">
                <div className="flex items-center justify-between border-b border-kv-border-muted pb-2 text-xs font-black text-kv-text">
                  <span>کادر ارزیابی و بازخورد کلاسی</span>
                </div>
                <div className="space-y-2 rounded-xl border border-kv-violet-border bg-kv-violet-soft/50 p-3 text-xs font-bold text-kv-text-secondary">
                  <div className="flex items-center justify-between">
                    <span>نمره علمی استاد (از ۱۰۰):</span>
                    <span className="font-black text-kv-violet">۹۲ (عالی)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>وضعیت تمدید مهلت:</span>
                    <span className="font-black text-kv-success">
                      هفته سوم تمدید شد
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
