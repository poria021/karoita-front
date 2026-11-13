'use client';

import { useActiveCourseDefinitions } from '@/hooks/useActiveCourseDefinitions';
import { isMockApiMode } from '@/lib/api-mode';

/**
 * بوت سرد شل برای همهٔ نقش‌ها: در real تا کاتالوگ `ready`/`error` نشود
 * لودر می‌ماند. mock فوری است؛ کش جلسه همان‌فریم `ready` می‌شود.
 */
export function useShellCatalogReady(): boolean {
  const mock = isMockApiMode();
  const definitions = useActiveCourseDefinitions(!mock);
  if (mock) return true;
  return definitions.status !== 'loading';
}
