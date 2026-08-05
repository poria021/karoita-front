import { MarketingSubpage } from '@/features/shared/marketing/components/MarketingSubpage';
import { loadMarketingChrome } from '@/features/shared/marketing/lib/loadMarketingChrome';

export default async function MarketingAdvantagesPage() {
  const { products, socials } = await loadMarketingChrome();

  return (
    <MarketingSubpage
      title="مزایای پلتفرم"
      description="پایش شفاف، کاهش کاغذبازی، و هم‌راستایی نقش‌ها — کارویتا عملیات آموزشی را برای نهادهای رسمی ساده و قابل اتکا می‌کند."
      products={products}
      socials={socials}
    />
  );
}
