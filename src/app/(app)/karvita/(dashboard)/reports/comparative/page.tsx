import { Suspense } from 'react';

import { ComparativeReportsModule } from '@/features/karvita/reports/components/ComparativeReportsModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('reports-comparative');

export default function ComparativeReportsRoutePage() {
  return (
    <Suspense fallback={null}>
      <ComparativeReportsModule />
    </Suspense>
  );
}
