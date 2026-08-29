import { SyllabusConfigIndexClient } from '@/features/karvita/syllabus-config/components/SyllabusConfigIndexClient';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('syllabus-course-offerings');

export default function SyllabusConfigIndexPage() {
  return <SyllabusConfigIndexClient />;
}
