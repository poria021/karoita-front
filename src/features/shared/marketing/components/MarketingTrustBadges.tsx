import { FaIcon } from '@/components/shared/FaIcon';
import { faIcons } from '@/utils/iconMap';

const TRUST_STATS = [
  {
    id: 'real-time-monitoring',
    icon: faIcons.server,
    title: 'پایش آنی',
    subtitle: '۵۰,۰۰۰+کارورز',
  },
  {
    id: 'integration',
    icon: faIcons.mapLocationDot,
    title: 'یکپارچه سازی',
    subtitle: 'مدیریت ۳۱ استان',
  },
  {
    id: 'compliance',
    icon: faIcons.fileContract,
    title: 'انطباق ۱۰۰٪',
    subtitle: 'روند دانشگاهی',
  },
  {
    id: 'deployment',
    icon: faIcons.rocket,
    title: 'استقرار چابک',
    subtitle: 'استقرار سریع سازمانی',
  },
] as const;

/**
 * Trust & capacity badges strip — immediately below hero.
 * Flat items on all breakpoints (no per-item card chrome).
 */
export function MarketingTrustBadges() {
  return (
    <section
      className="border-b border-kv-border-muted bg-kv-surface py-kv-inset"
      aria-label="آمار و ظرفیت سامانه"
    >
      <div className="mx-auto max-w-7xl px-kv-inset sm:px-kv-page">
        <div className="grid grid-cols-2 items-center justify-center gap-4 opacity-80 transition-all duration-500 hover:opacity-100 md:flex md:flex-wrap md:gap-12">
          {TRUST_STATS.map((stat) => (
            <div
              key={stat.id}
              className="flex items-stretch gap-kv-inline"
            >
              <span className="flex w-10 shrink-0 items-center justify-center rounded-kv-control border border-kv-border bg-kv-surface text-kv-text shadow-kv-soft sm:w-11">
                <FaIcon icon={stat.icon} size="lg" className="sm:text-xl" />
              </span>
              <div className="flex flex-col justify-center text-right">
                <span className="text-xs font-black leading-tight text-kv-text">
                  {stat.title}
                </span>
                <span className="mt-0.5 text-xs font-bold uppercase leading-tight tracking-wider text-kv-text-muted">
                  {stat.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
