import { throwRealModeNotImplemented } from '@/lib/api-mode';

/**
 * CMS لندینگ — هنوز endpoint Nest در فرانت تعریف نشده.
 * وقتی Swagger آماده شد، این ماژول را به apiClient وصل کنید.
 */
export function assertLandingCmsRealReady(surface: string): never {
  throwRealModeNotImplemented(surface);
}
