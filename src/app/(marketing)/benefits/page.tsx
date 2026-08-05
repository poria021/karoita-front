import { MarketingSubpage } from '@/features/shared/marketing/components/MarketingSubpage';
import { loadMarketingChrome } from '@/features/shared/marketing/lib/loadMarketingChrome';

export default async function MarketingBenefitsPage() {
  const { products, socials } = await loadMarketingChrome();

  return (
    <MarketingSubpage
      title="ارزش‌های عملیاتی"
      description="نقش‌ها، دسترسی‌ها و جریان‌های رسمی کارورزی و کارآموزی در یک پورتال یکپارچه — شفاف برای ستاد، منطقه و محیط اجرا."
      products={products}
      socials={socials}
    />
  );
}
