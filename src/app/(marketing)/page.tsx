import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { RouteService } from '@/services/route.service';
import { faIcons } from '@/utils/iconMap';

export default function MarketingHomePage() {
  return (
    <div
      className="kv-brand-atmosphere flex min-h-dvh w-full flex-col justify-between gap-kv-section p-kv-inset sm:p-kv-page"
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
            <FaIcon icon={faIcons.arrowLeft} size="sm" className="rtl:rotate-180" />
          </Link>
        </KvButton>
      </header>

      <main className="kv-auth-enter mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-kv-section text-center">
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
            <FaIcon icon={faIcons.tableColumns} size="sm" />
            <span>ورود به میز کار</span>
          </Link>
        </KvButton>
      </main>

      <footer className="mx-auto w-full max-w-6xl border-t border-kv-border-muted pt-kv-group text-center">
        <KvTypography variant="overline" tone="muted" align="center">
          تمام حقوق مادی و معنوی متعلق به سامانه آموزشی مهارتی کارویتا می‌باشد.
        </KvTypography>
      </footer>
    </div>
  );
}
