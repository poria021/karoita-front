import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { RouteService } from '@/services/route.service';
import { faIcons } from '@/utils/iconMap';

import { MarketingInternshipMockup } from './MarketingInternshipMockup';

function InternshipBlueprintArt() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 size-full select-none overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute left-1/2 top-1/2 h-[900px] w-[1440px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.18]"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="kvInternNeonBrand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--kv-brand)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--kv-info)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="kvInternNeonSuccess" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--kv-success)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--kv-success)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="kvInternNeonViolet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--kv-violet)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="var(--kv-violet)" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="kvInternGrid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--kv-border)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="var(--kv-border)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--kv-border)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g stroke="url(#kvInternGrid)" strokeWidth="0.5">
          <line x1="80" y1="0" x2="80" y2="900" />
          <line x1="280" y1="0" x2="280" y2="900" />
          <line x1="480" y1="0" x2="480" y2="900" strokeDasharray="4 8" />
          <line x1="720" y1="0" x2="720" y2="900" />
          <line x1="960" y1="0" x2="960" y2="900" strokeDasharray="4 8" />
          <line x1="1160" y1="0" x2="1160" y2="900" />
          <line x1="1360" y1="0" x2="1360" y2="900" />
        </g>

        <path
          d="M1200,220 C950,120 750,520 480,420 C320,360 200,580 80,480"
          stroke="url(#kvInternNeonBrand)"
          strokeWidth="1.5"
          strokeDasharray="3 6"
          fill="none"
        />
        <path
          d="M1200,220 C950,120 750,520 480,420 C320,360 200,580 80,480"
          stroke="url(#kvInternNeonBrand)"
          strokeWidth="0.75"
          fill="none"
        />
        <path
          d="M720,680 C500,720 380,320 280,220"
          stroke="url(#kvInternNeonSuccess)"
          strokeWidth="1.25"
          fill="none"
        />

        <g transform="translate(1080, 160)">
          <circle
            cx="80"
            cy="80"
            r="75"
            stroke="url(#kvInternNeonBrand)"
            strokeWidth="0.75"
            strokeDasharray="8 4"
          />
          <ellipse
            cx="80"
            cy="80"
            rx="55"
            ry="25"
            stroke="url(#kvInternNeonBrand)"
            strokeWidth="1"
            transform="rotate(-30 80 80)"
          />
          <ellipse
            cx="80"
            cy="80"
            rx="55"
            ry="25"
            stroke="url(#kvInternNeonBrand)"
            strokeWidth="1"
            transform="rotate(30 80 80)"
          />
          <circle
            cx="80"
            cy="80"
            r="16"
            fill="url(#kvInternNeonBrand)"
            fillOpacity="0.15"
            stroke="url(#kvInternNeonBrand)"
            strokeWidth="1.5"
          />
          <circle cx="80" cy="80" r="4" fill="var(--kv-brand)" />
        </g>

        <g transform="translate(620, 480)">
          <g stroke="url(#kvInternNeonViolet)" strokeWidth="1">
            <polygon
              points="100,20 150,45 100,70 50,45"
              fill="var(--kv-violet-soft)"
              fillOpacity="0.25"
            />
            <line x1="50" y1="45" x2="50" y2="95" />
            <line x1="100" y1="70" x2="100" y2="120" />
            <line x1="150" y1="45" x2="150" y2="95" />
          </g>
        </g>

        <g transform="translate(180, 260)">
          <g stroke="url(#kvInternNeonSuccess)" strokeWidth="1">
            <polygon
              points="40,120 110,85 110,135 40,170"
              fill="var(--kv-success-soft)"
              fillOpacity="0.2"
            />
            <path
              d="M60,150 L210,40 M210,40 L170,40 M210,40 L210,80"
              stroke="var(--kv-success)"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

export function MarketingInternshipSection() {
  const loginHref = RouteService.auth.login();

  return (
    <section id="internship" className="relative w-full">
      <InternshipBlueprintArt />

      <div className="relative z-10 mx-auto max-w-7xl px-kv-inset sm:px-kv-page">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="space-y-6 text-right lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 rounded-kv-control border border-kv-border-muted bg-kv-surface/80 px-3 py-1 text-xs font-black uppercase tracking-wider text-kv-text-secondary shadow-kv-soft">
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
                  <p className="mt-0.5 text-xs font-semibold leading-normal text-kv-text-muted">
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
                  <p className="mt-0.5 text-xs font-semibold leading-normal text-kv-text-muted">
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
                  <p className="mt-0.5 text-xs font-semibold leading-normal text-kv-text-muted">
                    ارائه آمار دقیق گزارش‌ها، وضعیت تایید کلاسی و کارنامه‌های مهارتی
                    متمرکز.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <KvButton asChild size="lg" color="cta" className="shadow-kv-raised">
                <Link href={loginHref} prefetch={false}>
                  <FaIcon icon={faIcons.rightToBracket} size="sm" />
                  <span>ورود به سامانه مدیریت کارورزی</span>
                </Link>
              </KvButton>
            </div>
          </div>

          <div className="lg:col-span-7">
            <MarketingInternshipMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
