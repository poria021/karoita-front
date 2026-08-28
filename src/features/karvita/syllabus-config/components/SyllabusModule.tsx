'use client';

import { SyllabusModulePageClient } from '@/features/karvita/syllabus-config/components/SyllabusModulePageClient';
import type { SyllabusConfigSubTab } from '@/types/syllabus-config';

type SyllabusModuleProps = {
  section: SyllabusConfigSubTab;
};

export function SyllabusModule(props: SyllabusModuleProps) {
  return <SyllabusModulePageClient {...props} />;
}
