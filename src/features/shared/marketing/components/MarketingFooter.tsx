import { FaIcon } from '@/components/shared/FaIcon';
import type { LandingSocial } from '@/types/landing-cms';
import { faIcons } from '@/utils/iconMap';

import { MarketingFooterSocials } from './MarketingFooterSocials';
import { MarketingPanelHomeLink } from './MarketingPanelHomeLink';
import { MarketingPwaInstallChip } from './MarketingPwaInstallChip';

type MarketingFooterProps = {
  socials: LandingSocial[];
};

/**
 * Public marketing footer — RSC shell with small client brand link + social marks.
 */
export function MarketingFooter({ socials }: MarketingFooterProps) {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-kv-border-muted bg-kv-surface/90 pb-6 pt-12 md:pt-16">
      <div className="relative z-10 mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
        <div className="grid grid-cols-1 gap-8 pb-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <MarketingPanelHomeLink className="flex items-center gap-3.5 transition-opacity hover:opacity-80">
              <div className="flex size-12 items-center justify-center rounded-kv-card bg-kv-brand font-black text-xl text-kv-brand-fg shadow-kv-raised shadow-kv-brand/20">
                K
              </div>
              <span className="text-3xl font-black leading-none tracking-tight text-kv-text">
                کارویتا
              </span>
            </MarketingPanelHomeLink>

            <div className="max-w-xl space-y-2 text-xs font-semibold text-kv-text-secondary">
              <p className="max-w-lg text-xs font-bold leading-relaxed text-kv-text-muted">
                شرکت کارویتا؛ مجری زیرساخت‌های هوشمند آموزش نظری، مهارتی و مدیریت
                دسترسی‌های سازمانی کشور.
              </p>
              <address className="flex flex-wrap items-center gap-2 text-xs font-bold not-italic text-kv-text-secondary">
                <FaIcon icon={faIcons.mapLocationDot} className="text-kv-brand" />
                <span>
                  تهران، بزرگراه رسالت، خیابان شهید یوسف کابلی، بن‌بست عضدی، پلاک
                  ۵، واحد ۱۴
                </span>
                <span aria-hidden>|</span>
                <a
                  href="tel:02188461206"
                  className="text-kv-brand underline-offset-2 transition-colors hover:underline"
                >
                  تلفن: ۸۸۴۶۱۲۰۶-۰۲۱
                </a>
              </address>
            </div>

            <div className="pt-1">
              <MarketingPwaInstallChip />
            </div>
          </div>

          <div className="my-auto flex items-center justify-center lg:col-span-5 lg:justify-end">
            <div className="grid w-auto grid-cols-3 gap-2.5">
              <div
                role="img"
                aria-label="نماد اعتماد الکترونیکی"
                className="flex h-32 w-28 select-none items-center justify-center rounded-kv-card border border-kv-border-muted bg-kv-surface-subtle/80 p-2 text-center text-xs font-black leading-snug text-kv-text shadow-kv-soft transition-colors duration-300 hover:border-kv-brand hover:bg-kv-surface hover:text-kv-brand"
              >
                نماد اعتماد الکترونیکی
              </div>

              <div
                role="img"
                aria-label="نشان ملی ساماندهی"
                className="flex h-32 w-28 select-none items-center justify-center rounded-kv-card border border-kv-border-muted bg-kv-surface-subtle/80 p-2 text-center text-xs font-black leading-snug text-kv-text shadow-kv-soft transition-colors duration-300 hover:border-kv-success hover:bg-kv-surface hover:text-kv-success"
              >
                نشان ملی ساماندهی
              </div>

              <div
                role="img"
                aria-label="تاییدیه دانش‌بنیان"
                className="flex h-32 w-28 select-none items-center justify-center rounded-kv-card border border-kv-border-muted bg-kv-surface-subtle/80 p-2 text-center text-xs font-black leading-snug text-kv-text shadow-kv-soft transition-colors duration-300 hover:border-kv-info hover:bg-kv-surface hover:text-kv-info"
              >
                تاییدیه دانش‌بنیان
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-kv-inset sm:px-kv-page">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-kv-border-muted pt-4 text-xs font-bold text-kv-text-muted sm:flex-row">
          <MarketingFooterSocials socials={socials} />

          <p>
            تمامی حقوق مادی و معنوی این سامانه متعلق به شرکت کارویتا می‌باشد. ©
            ۱۴۰۵
          </p>
        </div>
      </div>
    </footer>
  );
}
