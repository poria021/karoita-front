import Image from 'next/image';
import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { RouteService } from '@/services/route.service';
import { faIcons } from '@/utils/iconMap';

/**
 * Temporary product-faithful mocks in `public/marketing/`.
 * Replace with real captures when ready:
 * - Hero: `dashboard-hero.webp` (≈16:10 RTL admin/workspace, no promo overlays)
 * - Flow: `onboarding-flow.webp` (onboarding / document-approval queue)
 */
const HERO_VISUAL = {
  src: '/marketing/dashboard-hero.svg',
  width: 1600,
  height: 1000,
  alt: 'نمای میز کار کارویتا — شل مدیریتی نقش‌محور',
} as const;

const FLOW_VISUAL = {
  src: '/marketing/onboarding-flow.svg',
  width: 1280,
  height: 560,
  alt: 'جریان تأیید مدارک و پایش در کارویتا',
} as const;

const AUDIENCE_ROLES = [
  'دانشجویان و مهارت‌آموزان',
  'استادان و معلمان راهنما',
  'مدیران دانشکده و مدرسه',
  'تیم‌های حاکمیتی استان و ستاد',
] as const;

export default function MarketingHomePage() {
  const loginHref = RouteService.auth.login();

  return (
    <div
      className="kv-brand-atmosphere flex min-h-dvh w-full flex-col"
      dir="rtl"
    >
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-kv-group px-kv-inset pt-kv-inset sm:px-kv-page sm:pt-kv-page">
        <div className="flex items-center gap-kv-inline">
          <KarvitaBrandMark className="h-8 shadow-none sm:h-9" />
          <KvTypography variant="subtitle" as="p" tone="brand">
            کارویتا
          </KvTypography>
        </div>

        <KvButton asChild color="neutral" appearance="ghost" size="sm">
          <Link href={loginHref} prefetch={false}>
            <span>ورود به سامانه</span>
            <FaIcon
              icon={faIcons.arrowLeft}
              size="sm"
              className="rtl:rotate-180"
            />
          </Link>
        </KvButton>
      </header>

      <main className="flex w-full flex-1 flex-col">
        {/*
          A) First viewport = one composition (not a dashboard grid):
          brand + headline + support + CTA, then edge-to-edge product plane.
        */}
        <section
          className="flex min-h-[calc(100dvh-4.5rem)] flex-col"
          aria-labelledby="marketing-hero-brand"
        >
          <div className="kv-auth-enter mx-auto flex w-full max-w-3xl flex-col items-center gap-kv-section px-kv-inset pt-kv-region pb-kv-block text-center sm:px-kv-page sm:pt-kv-layout sm:pb-kv-region">
            <div className="flex flex-col items-center gap-kv-stack">
              <KarvitaBrandMark className="h-16 sm:h-20" />
              <KvTypography
                variant="display"
                tone="brand"
                as="h1"
                id="marketing-hero-brand"
                align="center"
              >
                کارویتا
              </KvTypography>
            </div>

            <div className="flex max-w-xl flex-col gap-kv-group">
              <KvTypography variant="title" as="p" align="center">
                سامانه جامع آموزش نظری و مهارتی
              </KvTypography>
              <KvTypography
                variant="body"
                tone="muted"
                as="p"
                align="center"
              >
                پورتال یکپارچه مدیریت دوره‌های کارورزی دانشگاهی و کارآموزی
                مهارتی — شفاف، رسمی، و نقش‌محور.
              </KvTypography>
            </div>

            <KvButton asChild size="lg" color="cta">
              <Link href={loginHref} prefetch={false}>
                ورود به میز کار
              </Link>
            </KvButton>
          </div>

          <figure className="kv-auth-enter-delay relative mt-auto min-h-[11rem] w-full flex-1 sm:min-h-[14rem]">
            {/* Soft seam into atmosphere — not a promo overlay on the product. */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-kv-canvas to-transparent sm:h-14"
              aria-hidden
            />
            <Image
              src={HERO_VISUAL.src}
              alt={HERO_VISUAL.alt}
              fill
              priority
              className="object-cover object-top"
              sizes="100vw"
            />
            <figcaption className="sr-only">{HERO_VISUAL.alt}</figcaption>
          </figure>
        </section>

        {/* B) One job: چه می‌کند؟ */}
        <section
          className="kv-auth-enter-late mx-auto flex w-full max-w-4xl flex-col gap-kv-block border-t border-kv-border-muted px-kv-inset py-kv-layout sm:px-kv-page"
          aria-labelledby="marketing-what-heading"
        >
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-kv-group text-center">
            <KvTypography
              variant="subtitle"
              as="h2"
              id="marketing-what-heading"
              align="center"
            >
              چه می‌کند؟
            </KvTypography>
            <KvTypography variant="body" tone="muted" align="center" as="p">
              از ورود و تکمیل پروفایل تا تأیید مدارک و پایش ترم — کارویتا جریان
              رسمی کارورزی و کارآموزی را در یک میز کار نقش‌محور جمع می‌کند.
            </KvTypography>
          </div>

          <figure className="w-full overflow-hidden rounded-kv-panel border border-kv-border-muted">
            <Image
              src={FLOW_VISUAL.src}
              alt={FLOW_VISUAL.alt}
              width={FLOW_VISUAL.width}
              height={FLOW_VISUAL.height}
              className="h-auto w-full"
              sizes="(max-width: 896px) 100vw, 896px"
            />
            <figcaption className="sr-only">{FLOW_VISUAL.alt}</figcaption>
          </figure>
        </section>

        {/* C) One job: برای چه کسانی؟ */}
        <section
          className="mx-auto flex w-full max-w-2xl flex-col gap-kv-stack border-t border-kv-border-muted px-kv-inset py-kv-layout sm:px-kv-page"
          aria-labelledby="marketing-audience-heading"
        >
          <div className="flex flex-col gap-kv-group text-center">
            <KvTypography
              variant="subtitle"
              as="h2"
              id="marketing-audience-heading"
              align="center"
            >
              برای چه کسانی؟
            </KvTypography>
            <KvTypography variant="body" tone="muted" align="center" as="p">
              هر نقش میز کار و مسیر ورود متناسب خود را دارد.
            </KvTypography>
          </div>

          <ul className="flex w-full flex-col gap-kv-pair text-start">
            {AUDIENCE_ROLES.map((role) => (
              <li
                key={role}
                className="flex items-start gap-kv-inline border-b border-kv-border-muted py-kv-pair last:border-b-0"
              >
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-kv-brand"
                  aria-hidden
                />
                <KvTypography variant="body" as="span">
                  {role}
                </KvTypography>
              </li>
            ))}
          </ul>
        </section>

        {/* D) Quiet legal footer */}
        <footer className="mt-auto flex flex-col gap-kv-group border-t border-kv-border-muted px-kv-inset py-kv-block text-center sm:px-kv-page">
          <KvTypography variant="caption" tone="muted" align="center" as="p">
            سامانه آموزشی کارورزی و کارآموزی — طراحی‌شده برای نهادهای رسمی آموزش.
          </KvTypography>
          <KvTypography variant="overline" tone="muted" align="center">
            تمام حقوق مادی و معنوی متعلق به سامانه آموزشی مهارتی کارویتا می‌باشد.
          </KvTypography>
        </footer>
      </main>
    </div>
  );
}
