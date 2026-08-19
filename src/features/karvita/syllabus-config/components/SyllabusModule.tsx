'use client';

import { loadDashboardClient } from '@/components/shared/shell/loadDashboardClient';
import type { SyllabusConfigSubTab } from '@/types/syllabus-config';

type SyllabusModuleProps = {
  section: SyllabusConfigSubTab;
};

const SyllabusModulePageClient = loadDashboardClient<SyllabusModuleProps>(() =>
  import('@/features/karvita/syllabus-config/components/SyllabusModulePageClient').then(
    (mod) => ({ default: mod.SyllabusModulePageClient })
  )
);

export function SyllabusModule(props: SyllabusModuleProps) {
  return <SyllabusModulePageClient {...props} />;
}
