import {
  SyllabusModulePageClient,
  type SyllabusModulePageProps,
} from '@/features/karvita/syllabus-config/components/SyllabusModulePageClient';

/** RSC boundary — syllabus config interactive module leaf. */
function SyllabusModulePage(props: SyllabusModulePageProps) {
  return <SyllabusModulePageClient {...props} />;
}

export function CourseOfferingsPage() {
  return <SyllabusModulePage section="course_offerings" />;
}

export function TermSettingsPage() {
  return <SyllabusModulePage section="term_settings" />;
}
