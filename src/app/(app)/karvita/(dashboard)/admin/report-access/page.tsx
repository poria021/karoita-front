import { redirect } from 'next/navigation';

import { ReportAccessModule } from '@/features/karvita/report-access/components/ReportAccessModule';
import { REPORTS_MODULE_ENABLED } from '@/features/karvita/reports/constants';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';
import { RouteService } from '@/services/route.service';

export const metadata = dashboardModuleMetadata('report-access');

export default function AdminReportAccessRoutePage() {
  if (!REPORTS_MODULE_ENABLED) {
    redirect(RouteService.karvita.adminDashboard());
  }
  return <ReportAccessModule />;
}
