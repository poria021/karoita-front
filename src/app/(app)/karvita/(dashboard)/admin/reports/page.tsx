import { redirect } from 'next/navigation';

import { DEFAULT_REPORT_SLUG } from '@/features/karvita/reports/constants';
import { RouteService } from '@/services/route.service';

export default function AdminReportsIndexPage() {
  redirect(RouteService.karvita.reports(DEFAULT_REPORT_SLUG));
}
