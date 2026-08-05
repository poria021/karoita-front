import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { FaIcon } from '@/components/shared/FaIcon';
import { RouteService } from '@/services/route.service';
import { faIcons } from '@/utils/iconMap';

export function MarketingInternshipSection() {
  const loginHref = RouteService.auth.login();

  return (
    <section className="relative w-full">
      <div className="pointer-events-none absolute inset-0 size-full select-none overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/4 top-12 size-[500px] rounded-full bg-kv-brand-soft/20 blur-[120px]" />
        <div className="absolute bottom-12 right-1/4 size-[400px] rounded-full bg-kv-success-soft/15 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-kv-inset sm:px-kv-page">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-6 text-right lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-kv-border-muted bg-kv-surface/80 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-kv-text-secondary shadow-sm">
              <span className="size-1.5 rounded-full bg-kv-brand" /> سامانه جامع
              کارآموزی و کارورزی
            </span>

            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-kv-text sm:text-3xl">
              سامانه جامع کارآموزی کارویتا
            </h2>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-kv-success-border bg-kv-success-soft text-kv-success">
                  <FaIcon icon={faIcons.check} size="xs" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-kv-text">
                    اتصال علمی تحصیل و کارآموزی
                  </h3>
                  <p className="mt-0.5 text-[11px] font-semibold leading-normal text-kv-text-muted">
                    تخصیص هوشمند سهمیه‌ها متناسب با نیازسنجی دقیق مدارس و مربیان.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-kv-success-border bg-kv-success-soft text-kv-success">
                  <FaIcon icon={faIcons.check} size="xs" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-kv-text">
                    ارزشیابی کیفی و پیوسته عملکرد
                  </h3>
                  <p className="mt-0.5 text-[11px] font-semibold leading-normal text-kv-text-muted">
                    پایش مستمر و ثبت مستقیم بازخوردهای هفتگی مربیان و مدیران مدرسه.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-kv-success-border bg-kv-success-soft text-kv-success">
                  <FaIcon icon={faIcons.check} size="xs" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-kv-text">
                    داشبورد یکپارچه ارزیابی صلاحیت
                  </h3>
                  <p className="mt-0.5 text-[11px] font-semibold leading-normal text-kv-text-muted">
                    ارائه آمار دقیق گزارش‌ها، وضعیت تایید کلاسی و کارنامه‌های مهارتی
                    متمرکز.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <KvButton asChild size="lg" color="cta" className="shadow-lg">
                <Link href={loginHref} prefetch={false}>
                  <FaIcon icon={faIcons.arrowLeft} size="sm" className="rtl:rotate-180" />
                  <span>ورود به سامانه مدیریت کارورزی</span>
                </Link>
              </KvButton>
            </div>
          </div>

          <div className="relative mt-8 flex h-[300px] w-full items-center justify-center sm:h-[340px] lg:col-span-7 lg:mt-0 lg:h-[360px]">
            <div className="absolute size-[200px] rounded-full bg-gradient-to-tr from-kv-brand/10 to-kv-violet/5 blur-[60px] sm:size-[260px]" />

            <div className="relative z-10 h-[210px] w-[75%] overflow-hidden rounded-2xl border border-kv-border-muted bg-kv-surface shadow-xl sm:h-[240px] sm:w-[70%] lg:h-[260px] lg:w-[72%]">
              <div className="flex h-10 items-center justify-between border-b border-kv-border-muted bg-kv-surface px-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 select-none items-center justify-center rounded-md bg-kv-brand text-[11px] font-black text-kv-brand-fg">
                    K
                  </div>
                  <span className="text-[9px] font-black text-kv-text">
                    مدیریت کارورزی کارویتا
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5 text-left text-[8px] font-bold text-kv-text-muted">
                    <div className="h-1.5 w-12 rounded bg-kv-border" />
                    <div className="h-1 w-8 rounded bg-kv-border-muted" />
                  </div>
                  <span className="text-xs text-kv-border">|</span>
                  <button className="text-kv-text-subtle hover:text-kv-text">
                    <FaIcon icon={faIcons.bell} size="xs" />
                  </button>
                  <span className="text-xs text-kv-border">|</span>
                  <button className="flex items-center gap-1 text-[9px] font-black text-kv-danger hover:text-kv-danger-hover">
                    <div className="h-1.5 w-3 rounded bg-kv-danger-soft" />
                    <FaIcon icon={faIcons.powerOff} size="2xs" />
                  </button>
                </div>
              </div>

              <div className="flex h-[calc(100%-40px)] w-full gap-2.5 bg-kv-surface-subtle p-2.5">
                <div className="flex w-[18%] shrink-0 flex-col gap-2.5 rounded-lg bg-kv-surface p-1.5">
                  <div className="h-px bg-kv-border-muted" />
                  <nav className="space-y-2">
                    <div className="flex items-center gap-1 text-kv-brand">
                      <FaIcon icon={faIcons.chartLine} size="2xs" className="w-3 text-center" />
                      <div className="h-1 w-1/2 rounded bg-kv-brand-soft" />
                    </div>
                    <div className="flex items-center gap-1 text-kv-text-subtle">
                      <FaIcon icon={faIcons.graduationCap} size="2xs" className="w-3 text-center" />
                      <div className="h-1 w-2/3 rounded bg-kv-border-muted" />
                    </div>
                    <div className="flex items-center gap-1 text-kv-text-subtle">
                      <FaIcon icon={faIcons.fileInvoice} size="2xs" className="w-3 text-center" />
                      <div className="h-1 w-1/3 rounded bg-kv-border-muted" />
                    </div>
                  </nav>
                </div>

                <div className="flex w-[82%] flex-col gap-2.5 overflow-hidden">
                  <div className="grid shrink-0 grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1 rounded-lg border border-kv-border-muted bg-kv-surface p-2">
                      <div className="flex items-center gap-1 text-kv-brand">
                        <FaIcon icon={faIcons.clipboardCheck} size="2xs" />
                        <div className="text-[9px] font-black text-kv-text">۲۴ گزارش</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 rounded-lg border border-kv-border-muted bg-kv-surface p-2">
                      <div className="flex items-center gap-1 text-kv-success">
                        <FaIcon icon={faIcons.circleCheck} size="2xs" />
                        <div className="text-[9px] font-black text-kv-text">۱۸ تایید</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 rounded-lg border border-kv-border-muted bg-kv-surface p-2">
                      <div className="flex items-center gap-1 text-kv-warning">
                        <FaIcon icon={faIcons.clock} size="2xs" />
                        <div className="text-[9px] font-black text-kv-text">۶ اصلاح</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-grow flex-col gap-1.5 overflow-hidden rounded-lg border border-kv-border-muted bg-kv-surface p-2.5">
                    <div className="flex shrink-0 items-center justify-between border-b border-kv-border-muted pb-1">
                      <div className="flex w-1/3 items-center gap-1">
                        <FaIcon icon={faIcons.clipboardList} size="2xs" className="text-kv-brand" />
                        <div className="h-1.5 w-1/2 rounded bg-kv-border" />
                      </div>
                      <span className="text-[8px] font-bold text-kv-text-subtle">
                        آخرین وضعیت
                      </span>
                    </div>

                    <div className="flex-grow overflow-auto">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 border-b border-kv-border-muted py-1">
                          <span className="text-[8px] font-mono text-kv-text-subtle">۱</span>
                          <div className="h-1 w-12 rounded bg-kv-border" />
                          <div className="h-1 w-16 rounded bg-kv-border-muted" />
                          <span className="inline-block rounded bg-kv-success-soft px-1 py-0.5 text-[7px] font-black text-kv-success">
                            تایید
                          </span>
                        </div>
                        <div className="flex items-center gap-2 py-1">
                          <span className="text-[8px] font-mono text-kv-text-subtle">۲</span>
                          <div className="h-1 w-14 rounded bg-kv-border" />
                          <div className="h-1 w-12 rounded bg-kv-border-muted" />
                          <span className="inline-block rounded bg-kv-warning-soft px-1 py-0.5 text-[7px] font-black text-kv-warning">
                            انتظار
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
