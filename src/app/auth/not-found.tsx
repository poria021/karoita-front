import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { PublicRouteStatusActions } from '@/components/shared/route-status/PublicRouteStatusActions';

export default function AuthNotFound() {
  return (
    <KvRouteStatus
      kind="notFound"
      title="صفحه مورد نظر یافت نشد"
      description="این مسیر احراز هویت در سامانه تعریف نشده است."
      hint="می‌توانید به نزدیک‌ترین مسیر احراز هویت یا صفحه فرود بازگردید."
      actions={<PublicRouteStatusActions />}
    />
  );
}
