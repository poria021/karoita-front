import { FaIcon } from '@/components/shared/FaIcon';
import { faIcons } from '@/utils/iconMap';

/**
 * قاب تزئینی محصول — مطابق موک کارورزی Landing-2 (ستون چپ).
 * طراحی با اندازه‌ی ثابت (۵۲۰×۳۶۰) ساخته شده و با `scale` برای سایزهای
 * کوچیک‌تر (موبایل/تبلت) smaller می‌شه؛ چیدمان داخلیش تو هیچ breakpoint
 * عوض نمی‌شه، فقط کل قاب مثل یه عکس کوچیک و بزرگ می‌شه.
 */
export function MarketingInternshipMockup() {
  return (
    <div className="relative mt-8 flex h-[224px] w-full items-center justify-center sm:h-[288px] lg:mt-0 lg:h-[360px]">
      <div className="relative flex h-[360px] w-[520px] origin-center items-center justify-center scale-[0.62] sm:scale-[0.8] lg:scale-100">
        <div className="relative z-10 h-[260px] w-[80%] overflow-hidden rounded-kv-card border border-kv-border-muted bg-kv-surface shadow-kv-floating">
          <div
            className="flex h-10 items-center justify-between border-b border-kv-border-muted bg-kv-surface px-3"
            dir="rtl"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-xs font-black text-kv-text">
                سامانه کارورزی کارویتا
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="flex flex-col gap-0.5 text-start text-xs font-bold text-kv-text-muted">
                <div className="h-1.5 w-12 rounded bg-kv-border" />
                <div className="h-1 w-8 rounded bg-kv-border-muted" />
              </div>
              <span className="text-xs text-kv-border">|</span>
              <span className="text-kv-text-subtle" aria-hidden>
                <FaIcon icon={faIcons.bell} size="2xs" />
              </span>
              <span className="text-xs text-kv-border">|</span>
              <span
                className="flex items-center gap-1 text-xs font-black text-kv-danger"
                aria-hidden
              >
                <div className="h-1.5 w-3 rounded bg-kv-danger-soft" />
                <FaIcon icon={faIcons.powerOff} size="2xs" />
              </span>
            </div>
          </div>

          <div
            className="flex h-[calc(100%-40px)] w-full gap-2.5 bg-kv-surface-subtle p-2.5"
            dir="rtl"
          >
            <div className="flex w-[18%] shrink-0 flex-col gap-2.5 rounded-kv-control bg-kv-surface p-1.5">
              <div className="h-px bg-kv-border-muted" />
              <nav className="space-y-2" aria-hidden>
                <div className="flex items-center gap-1 text-kv-brand">
                  <FaIcon
                    icon={faIcons.chartLine}
                    size="2xs"
                    className="w-3 text-center"
                  />
                  <div className="h-1 w-1/2 rounded bg-kv-brand-soft" />
                </div>
                <div className="flex items-center gap-1 text-kv-text-subtle">
                  <FaIcon
                    icon={faIcons.graduationCap}
                    size="2xs"
                    className="w-3 text-center"
                  />
                  <div className="h-1 w-2/3 rounded bg-kv-border-muted" />
                </div>
                <div className="flex items-center gap-1 text-kv-text-subtle">
                  <FaIcon
                    icon={faIcons.fileInvoice}
                    size="2xs"
                    className="w-3 text-center"
                  />
                  <div className="h-1 w-1/3 rounded bg-kv-border-muted" />
                </div>
                <div className="flex items-center gap-1 text-kv-text-subtle">
                  <FaIcon
                    icon={faIcons.sliders}
                    size="2xs"
                    className="w-3 text-center"
                  />
                  <div className="h-1 w-1/2 rounded bg-kv-border-muted" />
                </div>
              </nav>
            </div>

            <div className="flex w-[82%] flex-col gap-2.5 overflow-hidden">
              <div className="grid shrink-0 grid-cols-3 gap-2 whitespace-nowrap">
                <div className="flex flex-col gap-1 rounded-kv-control border border-kv-border-muted bg-kv-surface p-2">
                  <div className="flex items-center gap-1 text-kv-brand">
                    <FaIcon icon={faIcons.paperPlane} size="2xs" />
                    <div className="text-xs font-black text-kv-text">
                      ۲۴ گزارش ارسالی
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 rounded-kv-control border border-kv-border-muted bg-kv-surface p-2">
                  <div className="flex items-center gap-1 text-kv-success">
                    <FaIcon icon={faIcons.circleCheck} size="2xs" />
                    <div className="text-xs font-black text-kv-text">
                      ۱۸ تایید شده
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 rounded-kv-control border border-kv-border-muted bg-kv-surface p-2">
                  <div className="flex items-center gap-1 text-kv-warning">
                    <FaIcon icon={faIcons.clock} size="2xs" />
                    <div className="text-xs font-black text-kv-text">
                      ۶ نیاز به اصلاح
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-grow flex-col gap-1.5 overflow-hidden rounded-kv-control border border-kv-border-muted bg-kv-surface p-2.5">
                <div className="flex shrink-0 items-center justify-between border-b border-kv-border-muted pb-1">
                  <div className="flex w-1/3 items-center gap-1">
                    <FaIcon
                      icon={faIcons.listCheck}
                      size="2xs"
                      className="text-kv-brand"
                    />
                    <div className="h-1.5 w-1/2 rounded bg-kv-border" />
                  </div>
                  <span className="text-xs font-bold text-kv-text-subtle">
                    آخرین وضعیت
                  </span>
                </div>

                <div className="flex-grow overflow-auto">
                  <table className="w-full min-w-max whitespace-nowrap text-start text-xs">
                    <thead>
                      <tr className="border-b border-kv-border-muted text-kv-text-subtle">
                        <th className="w-10 pb-1 font-bold">#</th>
                        <th className="pb-1 font-bold">نام کارورز</th>
                        <th className="pb-1 font-bold">موضوع گزارش</th>
                        <th className="w-16 pb-1 text-center font-bold">
                          وضعیت
                        </th>
                        <th className="w-12 pb-1 text-end font-bold">
                          تاریخ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-kv-border-muted text-kv-text-secondary">
                      <tr>
                        <td className="py-1 font-mono">۱</td>
                        <td className="py-1">
                          <div className="h-1 w-12 rounded bg-kv-border" />
                        </td>
                        <td className="py-1">
                          <div className="h-1 w-16 rounded bg-kv-border-muted" />
                        </td>
                        <td className="py-1 text-center">
                          <span className="inline-block rounded-kv-control bg-kv-success-soft px-1 text-xs font-black text-kv-success">
                            تایید شده
                          </span>
                        </td>
                        <td className="py-1 text-end font-mono text-kv-text-subtle">
                          ۰۲/۱۵
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 font-mono">۲</td>
                        <td className="py-1">
                          <div className="h-1 w-14 rounded bg-kv-border" />
                        </td>
                        <td className="py-1">
                          <div className="h-1 w-12 rounded bg-kv-border-muted" />
                        </td>
                        <td className="py-1 text-center">
                          <span className="inline-block rounded-kv-control bg-kv-warning-soft px-1 text-xs font-black text-kv-warning">
                            در انتظار
                          </span>
                        </td>
                        <td className="py-1 text-end font-mono text-kv-text-subtle">
                          ۰۲/۱۸
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 start-[-88px] z-20 w-[210px] cursor-default rounded-kv-card border border-kv-border-muted bg-kv-surface/95 p-4 shadow-kv-overlay backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-black text-kv-text">
              پیشرفت مهارت تدریس
            </span>
            <span className="rounded-kv-control bg-kv-success-soft px-1.5 py-0.5 text-xs font-bold text-kv-success">
              ۸۸٪ عالی
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-kv-border-muted">
            <div
              className="h-full rounded-full bg-gradient-to-l from-kv-brand to-kv-success"
              style={{ width: '88%' }}
            />
          </div>
        </div>

        <div className="absolute -top-8 end-[-102px] z-20 w-[230px] cursor-default rounded-kv-card border border-kv-border-muted bg-kv-surface/95 p-4 text-kv-canvas shadow-kv-overlay backdrop-blur-md">
          <div className="mb-2 flex items-center gap-2.5">
            <div>
              <h4 className="text-xs font-black text-kv-text">
                مربی راهنما (مدرسه)
              </h4>
              <p className="text-xs text-kv-text/50">ارزیابی عملکرد کلاسی</p>
            </div>
          </div>
          <hr />
          <p className="pt-2 text-xs font-semibold leading-relaxed text-kv-text/80">
            «طرح درس اجرا شده با تسلط بالا و مدیریت عالی کلاس همراه بود.»
          </p>
        </div>
      </div>
    </div>
  );
}
