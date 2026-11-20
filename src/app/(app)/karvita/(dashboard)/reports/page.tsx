import { redirect } from 'next/navigation';

import { REPORTS_MODULE_ENABLED } from '@/features/karvita/reports/constants';
import { defaultOrgReportSlug } from '@/features/karvita/reports/lib/org-report-access';
import { RouteService } from '@/services/route.service';

export default function OrgReportsIndexPage() {
  if (!REPORTS_MODULE_ENABLED) {
    redirect(RouteService.karvita.dashboard());
  }
  redirect(
    RouteService.karvita.orgReports(
      defaultOrgReportSlug('central_organization')
    )
  );
}
