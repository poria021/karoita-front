import { redirect } from 'next/navigation';

import { defaultOrgReportSlug } from '@/features/karvita/reports/lib/org-report-access';
import { RouteService } from '@/services/route.service';

export default function OrgReportsIndexPage() {
  redirect(
    RouteService.karvita.orgReports(
      defaultOrgReportSlug('central_organization')
    )
  );
}
