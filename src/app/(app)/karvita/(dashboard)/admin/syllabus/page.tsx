import { redirect } from 'next/navigation';

import { RouteService } from '@/services/route.service';

export default function SyllabusConfigIndexPage() {
  redirect(RouteService.karvita.syllabusCourseOfferings());
}
