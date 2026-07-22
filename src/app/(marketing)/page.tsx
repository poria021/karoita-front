import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { RouteService } from '@/services/route.service';
import { faIcons } from '@/utils/iconMap';

export default function MarketingHomePage() {
  return (
    <div
      className="kv-brand-atmosphere flex min-h-dvh w-full flex-col gap-kv-region p-kv-inset sm:p-kv-page"
      dir="rtl"
    >
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-kv-group border-b border-kv-border/60 pb-kv-group">
        <div className="flex items-center gap-kv-inline">
          <div className="flex size-10 items-center justify-center rounded-kv-control bg-kv-brand text-kv-brand-fg shadow-kv-raised">
            <FaIcon icon={faIcons.graduationCap} size="md" />
          </div>
          <KvTypography variant="title" as="p" tone="brand">
            کارویتا
          </KvTypography>
        </div>

        <KvButton asChild color="neutral" appearance="ghost" size="sm">
          <Link href={RouteService.auth.login()} prefetch={false}>
            <span>ورود به سامانه</span>
            <FaIcon
              icon={faIcons.arrowLeft}
              size="sm"
              className="rtl:rotate-180"
            />
          </Link>
        </KvButton>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-kv-layout">
        <section className="kv-auth-enter mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-kv-section text-center">
          <div className="flex flex-col gap-kv-stack">
            <KvTypography variant="display" align="center" tone="brand">
              کارویتا
            </KvTypography>
            <KvTypography variant="title" align="center">
              سامانه جامع آموزش نظری و مهارتی
            </KvTypography>
            <KvTypography variant="body" tone="muted" align="center">
              پورتال یکپارچه مدیریت دوره‌های کارورزی دانشگاهی و کارآموزی مهارتی.
            </KvTypography>
          </div>

          <KvButton asChild size="lg" color="cta">
            <Link href={RouteService.auth.login()} prefetch={false}>
              ورود به میز کار
            </Link>
          </KvButton>
        </section>

        <section
          className="mx-auto flex w-full max-w-3xl flex-col gap-kv-group border-t border-kv-border-muted pt-kv-block"
          aria-labelledby="marketing-what-heading"
        >
          <KvTypography
            variant="subtitle"
            as="h2"
            id="marketing-what-heading"
            align="center"
          >
            چه می‌کند؟
          </KvTypography>
          <KvTypography variant="body" tone="muted" align="center" as="p">
            کارویتا فرآیندهای رسمی کارورزی و کارآموزی را از ورود و احراز هویت تا
            پایش ترم، سرفصل و گزارش‌دهی در یک میز کار سازمانی جمع می‌کند — با
            تمرکز بر وضوح نقش‌ها و عملیات روزمرهٔ دانشگاه و آموزش مهارتی.
          </KvTypography>
        </section>

        <section
          className="mx-auto flex w-full max-w-3xl flex-col gap-kv-group border-t border-kv-border-muted pt-kv-block pb-kv-section"
          aria-labelledby="marketing-audience-heading"
        >
          <KvTypography
            variant="subtitle"
            as="h2"
            id="marketing-audience-heading"
            align="center"
          >
            برای چه کسانی؟
          </KvTypography>
          <KvTypography variant="body" tone="muted" align="center" as="p">
            دانشجویان، مهارت‌آموزان، استادان و معلمان راهنما، مدیران مدرسه و
            دانشکده، و تیم‌های حاکمیتی استان و ستاد — هر نقش میز کار و مسیر ورود
            متناسب خود را دارد.
          </KvTypography>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl border-t border-kv-border-muted pt-kv-group text-center">
        <KvTypography variant="overline" tone="muted" align="center">
          تمام حقوق مادی و معنوی متعلق به سامانه آموزشی مهارتی کارویتا می‌باشد.
        </KvTypography>
      </footer>
    </div>
  );
}
