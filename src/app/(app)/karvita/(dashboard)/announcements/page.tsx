import { BulletinsManageModule } from '@/features/karvita/bulletins/components/BulletinsManageModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('announcements');

export default function AnnouncementsRoutePage() {
  return <BulletinsManageModule />;
}
