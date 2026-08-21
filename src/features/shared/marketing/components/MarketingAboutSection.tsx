import { FaIcon } from '@/components/shared/FaIcon';
import { faIcons } from '@/utils/iconMap';

export function MarketingAboutSection() {
  return (
    <section className="relative w-full overflow-hidden ">
      <div className="relative z-10 mx-auto max-w-7xl px-kv-inset sm:px-kv-page">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="group relative flex h-100 w-full shrink-0 items-center justify-center rounded-full lg:col-span-5">
            <div className="absolute size-90 rounded-full border border-kv-border-muted bg-kv-surface/60" />

            <svg
              className="pointer-events-none absolute inset-0 size-full"
              viewBox="0 0 400 400"
            >
              <line
                x1="200"
                y1="200"
                x2="200"
                y2="60"
                stroke="currentColor"
                strokeWidth="2"
                className="kv-data-flow text-kv-border-strong"
              />
              <line
                x1="200"
                y1="200"
                x2="345"
                y2="260"
                stroke="currentColor"
                strokeWidth="2"
                className="kv-data-flow text-kv-border-strong"
              />
              <line
                x1="200"
                y1="200"
                x2="90"
                y2="295"
                stroke="currentColor"
                strokeWidth="2"
                className="kv-data-flow text-kv-border-strong"
              />
            </svg>

            <div className="absolute inset-0">
              <div className="absolute left-1/2 top-[-2%] flex -translate-x-1/2 flex-col items-center">
                <div className="relative z-10 flex size-12 cursor-default items-center justify-center rounded-kv-card border border-kv-brand-border bg-kv-surface text-xl text-kv-brand shadow-kv-raised transition hover:scale-110">
                  <FaIcon icon={faIcons.buildingColumns} />
                </div>
                <span className="mt-1 rounded-kv-control border border-kv-border-muted bg-kv-surface px-2 py-0.5 text-xs font-black text-kv-text-muted">
                  پردیس‌های دانشگاهی
                </span>
              </div>

              <div className="absolute left-1/4 top-[74%] flex -translate-x-1/2 flex-col items-center">
                <div className="relative z-10 flex size-12 cursor-default items-center justify-center rounded-kv-card border border-kv-success-border bg-kv-surface text-xl text-kv-success shadow-kv-raised transition hover:scale-110">
                  <FaIcon icon={faIcons.school} />
                </div>
                <span className="mt-1 rounded-kv-control border border-kv-border-muted bg-kv-surface px-2 py-0.5 text-xs font-black text-kv-text-muted">
                  محیط مدارس و اجرا
                </span>
              </div>

              <div className="absolute right-2 top-[63%] flex -translate-x-2 flex-col items-center">
                <div className="relative z-10 flex size-12 cursor-default items-center justify-center rounded-kv-card border border-kv-info-border bg-kv-surface text-xl text-kv-info shadow-kv-raised transition hover:scale-110">
                  <FaIcon icon={faIcons.graduationCap} />
                </div>
                <span className="mt-1 rounded-kv-control border border-kv-border-muted bg-kv-surface px-2 py-0.5 text-xs font-black text-kv-text-muted">
                  کارورزان و دانشجو‌معلمان
                </span>
              </div>
            </div>

            <div className="relative z-20 flex size-28 flex-col items-center justify-center rounded-full bg-kv-brand text-kv-brand-fg shadow-kv-floating shadow-kv-brand/30 transition-transform duration-500 hover:scale-105">
              <FaIcon icon={faIcons.server} className="mb-1 text-3xl" />
              <span className="text-xs font-black tracking-tight">
                پلتفــرم کارویتا
              </span>
            </div>
          </div>

          <div className="relative space-y-6 text-right lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-kv-control border border-kv-border-muted bg-kv-surface/80 px-3 py-1 text-xs font-black uppercase tracking-wider text-kv-text-secondary shadow-kv-soft">
              <span className="size-1.5 rounded-full bg-kv-brand" /> درباره کارویتا
            </span>

            <h2 className="text-3xl font-black leading-tight tracking-tighter text-kv-text sm:text-4xl lg:text-[42px]">
              مفهـومِ تازه‌ای از اتوماسیـون،
              <br />
              در بستر یک{' '}
              <span className="text-kv-brand underline decoration-kv-brand-border underline-offset-8">
                اکوسیستـم زنده.
              </span>
            </h2>

            <p className="max-w-xl pb-2 text-justify text-xs font-semibold leading-relaxed text-kv-text-muted">
              <strong>کارویتا تنها یک ابزار نرم‌افزاری نیست؛</strong> بلکه هسته
              متمرکزی است که برای حذف اصطکاک میان نهاد دانشگاه به عنوان متولی
              علمی، و آموزش‌و‌پرورش به عنوان بازوی اجرایی ساخته شده است.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4 rounded-kv-card border border-kv-border-muted bg-kv-surface-subtle p-4 transition hover:border-kv-border hover:bg-kv-surface hover:shadow-kv-soft">
                <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-kv-control border border-kv-brand-border bg-kv-brand-soft text-kv-brand">
                  <FaIcon icon={faIcons.networkWired} size="sm" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-kv-text">
                    حلقه مفقوده نظارت یکپارچه
                  </h3>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-kv-text-muted">
                    سامانه به گونه‌ای مهندسی شده که فرآیند ارجاع، ارسال گزارشات و
                    صدور نمره را در یک شبکه شفاف متمرکز می‌کند؛ در نتیجه پدیده
                    اطلاعات گمشده و ارزیابی‌های به تاخیر افتاده کاملا حذف می‌شود.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-kv-card border border-kv-border-muted bg-kv-surface-subtle p-4 transition hover:border-kv-border hover:bg-kv-surface hover:shadow-kv-soft">
                <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-kv-control border border-kv-info-border bg-kv-info-soft text-kv-info">
                  <FaIcon icon={faIcons.chartPie} size="sm" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-kv-text">
                    تصمیم‌ساز و داده‌محور
                  </h3>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-kv-text-muted">
                    این زیرساخت از تجمیع آمار فرم‌های پرشده تغذیه کرده و
                    گزارش‌های تحلیلی را بلادرنگ به دست سازمان مرکزی، پردیس‌ها و
                    مناطق آموزشی می‌رساند.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
