import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';

/** فاصلهٔ مسیر مارکتینگ — لودر برند (فقط مقصد ورود/خروج). */
export default function MarketingLoading() {
  return <KvBrandLinearLoader fullViewport label="لطفا منتظر بمانید…" />;
}
