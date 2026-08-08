import { TermSettingsPage } from '@/features/karvita/syllabus-config/components/SyllabusModulePage';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('syllabus-term-settings');

export default function SyllabusTermSettingsRoutePage() {
  return <TermSettingsPage />;
}
