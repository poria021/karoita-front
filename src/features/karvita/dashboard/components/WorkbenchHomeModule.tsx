'use client';

import { loadDashboardClient } from '@/components/shared/shell/loadDashboardClient';

type WorkbenchHomeModuleProps = {
  subtitle: string;
  emptyDescription: string;
};

const WorkbenchHomeClient = loadDashboardClient<WorkbenchHomeModuleProps>(() =>
  import('@/features/karvita/dashboard/components/WorkbenchHomeClient').then(
    (mod) => ({ default: mod.WorkbenchHomeClient })
  )
);

export function WorkbenchHomeModule(props: WorkbenchHomeModuleProps) {
  return <WorkbenchHomeClient {...props} />;
}
