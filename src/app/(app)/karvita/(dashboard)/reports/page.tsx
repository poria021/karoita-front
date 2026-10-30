import { Suspense } from 'react';

import { ReportsModule } from '@/features/karvita/reports/components/ReportsModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('reports');

export default function StandardReportsRoutePage() {
  return (
    <Suspense fallback={null}>
      <ReportsModule />
    </Suspense>
  );
}
