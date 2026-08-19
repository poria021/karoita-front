import { SyllabusModule } from '@/features/karvita/syllabus-config/components/SyllabusModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('syllabus-term-settings');

export default function SyllabusTermSettingsRoutePage() {
  return <SyllabusModule section="term_settings" />;
}
