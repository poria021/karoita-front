import { ReportAccessModule } from '@/features/karvita/report-access/components/ReportAccessModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('report-access');

export default function AdminReportAccessRoutePage() {
  return <ReportAccessModule />;
}
