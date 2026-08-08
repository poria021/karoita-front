import { CourseOfferingsPage } from '@/features/karvita/syllabus-config/components/SyllabusModulePage';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('syllabus-course-offerings');

export default function SyllabusCourseOfferingsRoutePage() {
  return <CourseOfferingsPage />;
}
