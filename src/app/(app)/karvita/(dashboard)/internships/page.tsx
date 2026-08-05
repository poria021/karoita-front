import { redirect } from 'next/navigation';

import { RouteService } from '@/services/route.service';

/** ایندکس انتخاب واحد → زیرماژول سطح ۱ (مثل HTML: internship1). */
export default function InternshipEnrollmentIndexPage() {
  redirect(RouteService.karvita.internshipSelection(1));
}
