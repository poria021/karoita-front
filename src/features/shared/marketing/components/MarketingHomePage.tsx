import { MarketingAboutSection } from '@/features/shared/marketing/components/MarketingAboutSection';
import { MarketingAdvantagesSection } from '@/features/shared/marketing/components/MarketingAdvantagesSection';
import { MarketingBenefitsSection } from '@/features/shared/marketing/components/MarketingBenefitsSection';
import { MarketingHomeHero } from '@/features/shared/marketing/components/MarketingHomeHero';
import { MarketingInternshipSection } from '@/features/shared/marketing/components/MarketingInternshipSection';
import { MarketingShell } from '@/features/shared/marketing/components/MarketingShell';
import { MarketingTrustBadges } from '@/features/shared/marketing/components/MarketingTrustBadges';
import type { MarketingChromeData } from '@/features/shared/marketing/lib/loadMarketingChrome';
import { MarketingPanel } from '@/features/shared/marketing/lib/marketingPanelContext';

type MarketingHomePageProps = {
  /** chrome SSR از Landing CMS / Nest تا HTML اول crawlپذیر باشد. */
  initialChrome: MarketingChromeData;
};

/**
 * لندینگ عمومی به‌صورت ترکیب RSC.
 * برگ‌های کلاینت: کاروسل هیرو، پنل ناو، داک (از طریق shell)، تب مزایا.
 */
export function MarketingHomePage({ initialChrome }: MarketingHomePageProps) {
  return (
    <MarketingShell initialChrome={initialChrome} overlayHeader>
      <MarketingHomeHero />
      <MarketingTrustBadges />

      <MarketingPanel id="benefits">
        <MarketingBenefitsSection />
      </MarketingPanel>
      <MarketingPanel id="about">
        <MarketingAboutSection />
      </MarketingPanel>
      <MarketingPanel id="internship">
        <MarketingInternshipSection />
      </MarketingPanel>
      <MarketingPanel id="advantages">
        <MarketingAdvantagesSection />
      </MarketingPanel>
    </MarketingShell>
  );
}
