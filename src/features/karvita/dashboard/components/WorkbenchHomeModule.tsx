'use client';

import { WorkbenchHomeClient } from '@/features/karvita/dashboard/components/WorkbenchHomeClient';

type WorkbenchHomeModuleProps = {
  subtitle: string;
  emptyDescription: string;
};

export function WorkbenchHomeModule(props: WorkbenchHomeModuleProps) {
  return <WorkbenchHomeClient {...props} />;
}
