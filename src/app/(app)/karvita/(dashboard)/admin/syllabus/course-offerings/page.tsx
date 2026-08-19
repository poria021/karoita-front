import { SyllabusModule } from '@/features/karvita/syllabus-config/components/SyllabusModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('syllabus-course-offerings');

export default function SyllabusCourseOfferingsRoutePage() {
  return <SyllabusModule section="course_offerings" />;
}
