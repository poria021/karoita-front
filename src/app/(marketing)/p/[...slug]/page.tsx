import { notFound } from 'next/navigation';

type MarketingCmsPageProps = {
  params: Promise<{ slug: string[] }>;
};

/**
 * Reserved public CMS surface (`/p/...`) between landing and auth.
 * Slugs without a published page call `notFound()` → marketing/root status UI
 * (صفحه فرود + ورود). Wire Nest/CMS lookup here when public pages ship.
 */
export default async function MarketingCmsPublicPage({
  params,
}: MarketingCmsPageProps) {
  await params;
  notFound();
}
