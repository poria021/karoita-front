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
 * Trust & capacity badges strip — immediately below hero (rule 90: trust strip below fold).
 * Mobile: 2 cols with card chrome; desktop: flex row, transparent.
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
              className="flex items-center gap-kv-inline rounded-xl border border-kv-border-muted bg-kv-surface-subtle p-kv-pair md:border-none md:bg-transparent md:p-0"
            >
              <FaIcon
                icon={stat.icon}
                size="lg"
                className="shrink-0 text-kv-brand sm:text-xl"
              />
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-kv-text">
                  {stat.title}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-kv-text-muted">
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
