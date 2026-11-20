import { redirect } from 'next/navigation';

import {
  DEFAULT_REPORT_SLUG,
  REPORTS_MODULE_ENABLED,
} from '@/features/karvita/reports/constants';
import { RouteService } from '@/services/route.service';

export default function AdminReportsIndexPage() {
  if (!REPORTS_MODULE_ENABLED) {
    redirect(RouteService.karvita.adminDashboard());
  }
  redirect(RouteService.karvita.reports(DEFAULT_REPORT_SLUG));
}
