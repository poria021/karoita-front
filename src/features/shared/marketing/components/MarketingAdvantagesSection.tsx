import { FaIcon } from '@/components/shared/FaIcon';
import { faIcons } from '@/utils/iconMap';

export function MarketingAdvantagesSection() {
  return (
    <section className="relative w-full overflow-visible">
      <div className="relative z-10 mx-auto max-w-7xl px-kv-inset sm:px-kv-page">
        <div className="relative mx-auto mb-10 max-w-3xl space-y-4 text-center md:mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-kv-border-muted bg-kv-surface/80 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-kv-text-secondary shadow-sm">
            <span className="size-1.5 rounded-full bg-kv-brand" /> تغییر پارادایم
            مدیریت آموزشی
          </span>
          <h2 className="text-2xl font-black leading-tight tracking-tighter text-kv-text drop-shadow-sm sm:text-2xl lg:text-2xl">
            گذر از بروکراسیِ پر دردسر سنتی
          </h2>
          <h2 className="text-3xl font-black leading-tight tracking-tighter text-kv-text drop-shadow-sm sm:text-4xl lg:text-4xl">
            تسریع فرایند ها به صورت آنلاین
          </h2>

          <p className="mx-auto max-w-xl text-[11px] font-bold leading-relaxed text-kv-text-muted sm:text-xs">
            رویکرد تقابلی سامانه کارویتا در برابر فرآیند های قدیمی ، کاهش زمان و
            جلوگیری از اتلاف هزینه های اداری با تمرکز بر ثبت و پردازشِ آنی
            اطلاعات مهارتی است.
          </p>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="relative flex flex-col items-center gap-6 lg:flex-row lg:gap-0">
            <div className="relative z-10 w-full opacity-90 grayscale transition-all duration-500 hover:grayscale-0 lg:-mr-4 lg:w-1/2 lg:rounded-l-none lg:rounded-r-3xl">
              <div className="rounded-3xl border border-kv-border-muted bg-kv-surface/50 p-6 backdrop-blur-md sm:p-8 lg:rounded-l-none lg:rounded-r-3xl">
                <div className="absolute inset-x-10 top-0 h-0.5 bg-[repeating-linear-gradient(to_left,currentColor,currentColor_4px,transparent_4px,transparent_8px)] text-kv-border" />

                <div className="mb-8 flex items-center justify-between border-b border-dashed border-kv-border pb-4">
                  <h3 className="text-sm font-black text-kv-text-subtle">
                    بایگانی فیزیکی (نسل گذشته)
                  </h3>
                </div>

                <ul className="space-y-4 text-xs font-bold text-kv-text-muted">
                  <li className="flex items-start gap-3">
                    <FaIcon
                      icon={faIcons.arrowRight}
                      size="xs"
                      className="mt-0.5 shrink-0 rotate-90 text-kv-text-faint"
                    />
                    <span>
                      مستندسازی پرحجم کاغذی با ریسک خطای بالا در بایگانی مناطق.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaIcon
                      icon={faIcons.arrowRight}
                      size="xs"
                      className="mt-0.5 shrink-0 rotate-90 text-kv-text-faint"
                    />
                    <span>
                      انفعال کامل در پایش؛ دسترسی به وضعیت حضور غیاب تنها پس از
                      اتمام ترم.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaIcon
                      icon={faIcons.arrowRight}
                      size="xs"
                      className="mt-0.5 shrink-0 rotate-90 text-kv-text-faint"
                    />
                    <span>
                      پراکندگی اطلاعات نمرات عملی در فرم‌های دست‌نویس با تاخیر
                      انتقال چندماهه.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative z-30 shrink-0 transform lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
              <div className="group flex size-14 cursor-pointer items-center justify-center rounded-full border border-kv-brand-border bg-kv-surface p-2 shadow-[0_12px_24px_-4px] shadow-kv-brand/30 transition-transform duration-700 ease-in-out hover:rotate-180">
                <div className="flex size-full items-center justify-center rounded-full bg-kv-brand text-kv-brand-fg shadow-inner">
                  <FaIcon icon={faIcons.arrowRight} className="text-base lg:rotate-180" />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-kv-brand blur-xl opacity-40" />
            </div>

            <div className="relative z-20 w-full border-kv-brand-border transition-all duration-500 lg:-ml-6 lg:w-[55%] lg:-translate-x-4">
              <div className="rounded-3xl border border-kv-brand-border bg-kv-surface p-8 shadow-xl shadow-kv-brand/10">
                <div className="mb-8 flex items-center justify-between border-b border-kv-border-muted pb-2">
                  <div className="flex items-center gap-3">
                    <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-kv-brand-border text-lg font-black text-kv-brand">
                      <FaIcon icon={faIcons.shield} className="relative z-10" />
                    </div>
                    <h3 className="text-sm font-black tracking-tight text-kv-text sm:text-base">
                      سامانه جامع مهارتی کارویتا
                    </h3>
                  </div>
                </div>

                <ul className="text-[11px] font-black text-kv-text-secondary sm:text-xs">
                  <li className="flex gap-4 p-3">
                    <FaIcon
                      icon={faIcons.check}
                      className="mt-0.5 shrink-0 text-base text-kv-success"
                    />
                    <div className="flex flex-col">
                      <span className="text-[11px] text-kv-text">
                        امکان ارسال و نگهداری از مستند ها به صورت آنلاین بدون ریسک
                        از دست رفتن اطلاعات
                      </span>
                    </div>
                  </li>
                  <li className="flex gap-4 p-3">
                    <FaIcon
                      icon={faIcons.check}
                      className="mt-0.5 shrink-0 text-base text-kv-success"
                    />
                    <div className="flex flex-col">
                      <span className="text-[11px] text-kv-text">
                        امکان ارزیابی و ثبت بازخوردهای مستمر علمی توسط اساتید و
                        معلمان راهنما
                      </span>
                    </div>
                  </li>
                  <li className="flex gap-4 p-3">
                    <FaIcon
                      icon={faIcons.check}
                      className="mt-0.5 shrink-0 text-base text-kv-success"
                    />
                    <div className="flex flex-col">
                      <span className="text-[11px] text-kv-text">
                        امکان مشاهده وضعیت ارسال گزارش های فراگیر در یک نما به صورت
                        آنی
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
