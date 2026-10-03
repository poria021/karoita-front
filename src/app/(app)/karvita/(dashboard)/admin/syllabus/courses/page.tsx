import { CourseCatalogModule } from '@/features/karvita/syllabus-config/components/course-catalog/CourseCatalogModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('syllabus-course-catalog');

export default function SyllabusCourseCatalogRoutePage() {
  return <CourseCatalogModule />;
}
