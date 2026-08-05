import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { RouteService } from '@/services/route.service';
import type { LandingProduct, LandingSocial } from '@/types/landing-cms';

import { MarketingShell } from './MarketingShell';

type MarketingSubpageProps = {
  title: string;
  description: string;
  products: LandingProduct[];
  socials: LandingSocial[];
};

/** Thin brand-loud marketing leaf — no skeletons, RouteService login CTA. */
export function MarketingSubpage({
  title,
  description,
  products,
  socials,
}: MarketingSubpageProps) {
  return (
    <MarketingShell products={products} socials={socials}>
      <section
        className="kv-auth-enter mx-auto flex w-full max-w-2xl flex-col items-center gap-kv-section px-kv-inset py-kv-layout text-center sm:px-kv-page"
        aria-labelledby="marketing-subpage-title"
      >
        <KvTypography
          variant="title"
          as="h1"
          id="marketing-subpage-title"
          align="center"
        >
          {title}
        </KvTypography>
        <KvTypography variant="body" tone="muted" as="p" align="center">
          {description}
        </KvTypography>
        <KvButton asChild size="lg" color="cta">
          <Link href={RouteService.auth.login()} prefetch={false}>
            ورود به میز کار
          </Link>
        </KvButton>
      </section>
    </MarketingShell>
  );
}
