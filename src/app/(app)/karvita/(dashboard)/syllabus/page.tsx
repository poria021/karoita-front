import { redirect } from 'next/navigation';

import { RouteService } from '@/services/route.service';

export default function LegacySyllabusConfigRedirect() {
  redirect(RouteService.karvita.syllabusConfig());
}
