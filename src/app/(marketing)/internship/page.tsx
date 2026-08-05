import { MarketingSubpage } from '@/features/shared/marketing/components/MarketingSubpage';
import { loadMarketingChrome } from '@/features/shared/marketing/lib/loadMarketingChrome';

export default async function MarketingInternshipPage() {
  const { products, socials } = await loadMarketingChrome();

  return (
    <MarketingSubpage
      title="سامانه کارآموزی و کارورزی"
      description="از انتخاب واحد تا گزارش روزانه و ارزیابی — مسیر کارورزی و کارآموزی در میز کار نقش‌محور کارویتا پیگیری می‌شود."
      products={products}
      socials={socials}
    />
  );
}
