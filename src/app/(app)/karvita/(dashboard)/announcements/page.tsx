import { BulletinsHubModule } from '@/features/karvita/bulletins/components/BulletinsHubModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('announcements');

export default function AnnouncementsRoutePage() {
  return <BulletinsHubModule />;
}
