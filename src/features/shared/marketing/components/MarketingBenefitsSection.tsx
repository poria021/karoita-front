import { FaIcon } from '@/components/shared/FaIcon';
import {
  AppTabs,
  AppTabsContent,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { faIcons } from '@/utils/iconMap';

type RoleTab = 'hq' | 'region' | 'exec';

export function MarketingBenefitsSection() {
  return (
    <section className="relative">
      <div className="relative z-10 mx-auto max-w-7xl px-kv-inset sm:px-kv-page">
        <div className="mx-auto mb-8 max-w-3xl space-y-3 text-center md:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-kv-control border border-kv-border-muted bg-kv-surface/80 px-3 py-1 text-xs font-black uppercase tracking-wider text-kv-text-secondary shadow-kv-soft">
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

        <AppTabs
          defaultValue={'hq' satisfies RoleTab}
          fullWidth
          activeTone="brand"
          gridCols={3}
          className="mb-0 gap-kv-group"
        >
          <AppTabsList className="mx-auto mb-10 max-w-4xl">
            <AppTabsTrigger value="hq" className="gap-1.5">
              <FaIcon icon={faIcons.buildingColumns} size="sm" />
              سازمان مرکزی و دانشگاه‌ها
            </AppTabsTrigger>
            <AppTabsTrigger value="region" className="gap-1.5">
              <FaIcon icon={faIcons.school} size="sm" />
              ادارات مناطق و مدارس
            </AppTabsTrigger>
            <AppTabsTrigger value="exec" className="gap-1.5">
              <FaIcon icon={faIcons.chalkboardUser} size="sm" />
              اساتید، مربیان و دانشجویان
            </AppTabsTrigger>
          </AppTabsList>

          <div className="rounded-kv-card border border-kv-border-muted bg-kv-surface-subtle p-6 shadow-kv-soft sm:p-10">
            <AppTabsContent value="hq" className="mt-0">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                <div className="space-y-4 text-end lg:col-span-6">
                  <span className="inline-block rounded-kv-control bg-kv-brand-soft px-3 py-1 text-xs font-extrabold text-kv-brand-soft-fg">
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
                <div className="space-y-3 rounded-kv-card border border-kv-border-muted bg-kv-surface p-5 shadow-kv-soft lg:col-span-6">
                  <div className="flex items-center justify-between border-b border-kv-border-muted pb-2 text-xs font-black text-kv-text">
                    <span>کنسول مدیریت سازمان مرکزی</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-end">
                    <div className="rounded-kv-control border border-kv-brand-border bg-kv-brand-soft/50 p-3">
                      <span className="block text-xs font-extrabold text-kv-text-subtle">
                        پردیس‌های فعال
                      </span>
                      <span className="mt-0.5 block text-base font-black text-kv-brand-soft-fg">
                        ۳۱ در استان
                      </span>
                    </div>
                    <div className="rounded-kv-control border border-kv-success-border bg-kv-success-soft/50 p-3">
                      <span className="block text-xs font-extrabold text-kv-text-subtle">
                        نرخ تکمیل ارزیابی
                      </span>
                      <span className="mt-0.5 block text-base font-black text-kv-success-soft-fg">
                        ۹۶.۴٪
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </AppTabsContent>

            <AppTabsContent value="region" className="mt-0">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                <div className="space-y-4 text-end lg:col-span-6">
                  <span className="inline-block rounded-kv-control bg-kv-success-soft px-3 py-1 text-xs font-extrabold text-kv-success-soft-fg">
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
                <div className="space-y-3 rounded-kv-card border border-kv-border-muted bg-kv-surface p-5 shadow-kv-soft lg:col-span-6">
                  <div className="flex items-center justify-between border-b border-kv-border-muted pb-2 text-xs font-black text-kv-text">
                    <span>پنل مانیتورینگ مدارس منطقه</span>
                  </div>
                  <div className="space-y-2 rounded-kv-control bg-kv-surface-subtle p-3 text-xs font-bold text-kv-text-secondary">
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
            </AppTabsContent>

            <AppTabsContent value="exec" className="mt-0">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                <div className="space-y-4 text-end lg:col-span-6">
                  <span className="inline-block rounded-kv-control bg-kv-info-soft px-3 py-1 text-xs font-extrabold text-kv-info-soft-fg">
                    اجرایی، آموزشی و مهارتی
                  </span>
                  <h3 className="text-xl font-black text-kv-text">
                    فرآیند آسان ارسال، بازخورد و تمدید مهلت
                  </h3>
                  <ul className="space-y-3 pt-2 text-xs font-bold text-kv-text-secondary">
                    <li className="flex items-start gap-2.5">
                      <FaIcon
                        icon={faIcons.circleCheck}
                        className="mt-0.5 shrink-0 text-kv-info"
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
                        className="mt-0.5 shrink-0 text-kv-info"
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
                        className="mt-0.5 shrink-0 text-kv-info"
                        size="sm"
                      />
                      <span>
                        امکان تمدید هفته یک هفته به صورت گروهی در صورت منقضی شدن
                        زمان ارسال گزارش هفتگی
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3 rounded-kv-card border border-kv-border-muted bg-kv-surface p-5 shadow-kv-soft lg:col-span-6">
                  <div className="flex items-center justify-between border-b border-kv-border-muted pb-2 text-xs font-black text-kv-text">
                    <span>کادر ارزیابی و بازخورد کلاسی</span>
                  </div>
                  <div className="space-y-2 rounded-kv-control border border-kv-info-border bg-kv-info-soft/50 p-3 text-xs font-bold text-kv-text-secondary">
                    <div className="flex items-center justify-between">
                      <span>نمره علمی استاد (از ۱۰۰):</span>
                      <span className="font-black text-kv-info">۹۲ (عالی)</span>
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
            </AppTabsContent>
          </div>
        </AppTabs>
      </div>
    </section>
  );
}
