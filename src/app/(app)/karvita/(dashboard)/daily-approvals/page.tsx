import { DailyApprovalsModule } from '@/features/karvita/daily-approvals/components/DailyApprovalsModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('daily-approvals');

export default function DailyApprovalsRoutePage() {
  return <DailyApprovalsModule />;
}
