import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';

/** داخل کارت auth — بدون گلو و بدون full-viewport atmosphere. */
export function AuthCardRouteFallback() {
  return (
    <KvBrandLinearLoader
      className="min-h-40 w-full bg-transparent"
      label="لطفا منتظر بمانید…"
    />
  );
}
