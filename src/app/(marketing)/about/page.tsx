import { MarketingSubpage } from '@/features/shared/marketing/components/MarketingSubpage';
import { loadMarketingChrome } from '@/features/shared/marketing/lib/loadMarketingChrome';

export default async function MarketingAboutPage() {
  const { products, socials } = await loadMarketingChrome();

  return (
    <MarketingSubpage
      title="درباره کارویتا"
      description="کارویتا بستر رسمی پیوند پردیس‌های دانشگاهی، مدارس و نهادهای حاکمیتی برای آموزش نظری و مهارتی است."
      products={products}
      socials={socials}
    />
  );
}
