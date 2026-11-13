import { FaIcon } from '@/components/shared/FaIcon';
import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import type { LandingSocial } from '@/types/landing-cms';
import { faIcons } from '@/utils/iconMap';

import { MarketingFooterSocials } from './MarketingFooterSocials';
import { MarketingPanelHomeLink } from './MarketingPanelHomeLink';
import { MarketingPwaInstallChip } from './MarketingPwaInstallChip';

type MarketingFooterProps = {
  socials: LandingSocial[];
};

const TRUST_SEALS = [
  { id: 'enamad', label: 'نماد اعتماد الکترونیکی' },
  { id: 'samandehi', label: 'نشان ملی ساماندهی' },
  { id: 'knowledge', label: 'تاییدیه دانش‌بنیان' },
] as const;

/**
 * فوتر مارکتینگ — هویت برند، تماس، نصب، نشان‌ها و متای حقوقی.
 * فقط توکن‌های `kv-*`؛ بدون کارت تعاملی غیرضروری.
 */
export function MarketingFooter({ socials }: MarketingFooterProps) {
  return (
    <footer className="relative z-10 border-t border-kv-border-muted bg-kv-surface">
      <div className="mx-auto max-w-7xl px-kv-inset sm:px-kv-page">
        <div className="grid grid-cols-1 gap-kv-layout py-kv-layout lg:grid-cols-12 lg:items-end lg:gap-kv-region lg:py-16">
          <div className="flex flex-col gap-kv-section lg:col-span-7">
            <div className="space-y-kv-inline">
              <MarketingPanelHomeLink className="inline-flex items-center gap-kv-pair transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring">
                <KarvitaBrandMark className="!size-10 sm:!size-11" />
                <span className="text-2xl font-black leading-none tracking-tight text-kv-brand sm:text-[1.75rem]">
                  کارویتا
                </span>
              </MarketingPanelHomeLink>

              <p className="max-w-md text-sm font-medium leading-relaxed text-kv-text-secondary">
                زیرساخت هوشمند آموزش نظری، مهارتی و مدیریت دسترسی‌های سازمانی.
              </p>
            </div>

            <address className="flex max-w-lg flex-col gap-kv-inline text-sm not-italic">
              <div className="flex items-start gap-kv-inline text-kv-text-muted">
                <FaIcon
                  icon={faIcons.mapLocationDot}
                  className="mt-0.5 shrink-0 text-kv-brand"
                />
                <span className="font-medium leading-relaxed">
                  تهران، بزرگراه رسالت، خیابان شهید یوسف کابلی، بن‌بست عضدی، پلاک
                  ۵، واحد ۱۴
                </span>
              </div>
              <a
                href="tel:02188461206"
                className="inline-flex w-fit items-center gap-kv-inline font-semibold text-kv-brand underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring"
              >
                <FaIcon icon={faIcons.mobileScreen} className="shrink-0" />
                <span>۰۲۱-۸۸۴۶۱۲۰۶</span>
              </a>
            </address>

            <div className="pt-kv-pair">
              <MarketingPwaInstallChip />
            </div>
          </div>

          <div className="lg:col-span-5 lg:justify-self-end">
            <ul className="flex flex-wrap justify-start gap-kv-pair sm:gap-kv-inline lg:justify-end">
              {TRUST_SEALS.map((seal) => (
                <li key={seal.id}>
                  <div
                    role="img"
                    aria-label={seal.label}
                    className="flex h-24 w-[4.75rem] select-none items-center justify-center border border-kv-border-muted bg-kv-surface-subtle px-1.5 text-center text-xs font-bold leading-snug text-kv-text-muted sm:h-28 sm:w-24"
                  >
                    {seal.label}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-kv-section border-t border-kv-border-muted py-kv-section sm:flex-row sm:gap-kv-group">
          <MarketingFooterSocials socials={socials} />
          <p className="text-center text-xs font-medium leading-relaxed text-kv-text-muted sm:text-end">
            تمامی حقوق مادی و معنوی این سامانه متعلق به شرکت کارویتا می‌باشد. ©
            ۱۴۰۵
          </p>
        </div>
      </div>
    </footer>
  );
}
