import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';

/** Marketing route gap — brand loader (login/logout destination only). */
export default function MarketingLoading() {
  return <KvBrandLinearLoader fullViewport label="لطفا منتظر بمانید…" />;
}
