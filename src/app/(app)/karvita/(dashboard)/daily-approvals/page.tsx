import { DailyApprovalsPage } from '@/features/karvita/daily-approvals/components/DailyApprovalsPage';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('daily-approvals');

export default function DailyApprovalsRoutePage() {
  return <DailyApprovalsPage />;
}
