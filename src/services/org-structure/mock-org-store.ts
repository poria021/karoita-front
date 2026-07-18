import { isMockApiMode } from '@/lib/api-mode';
import { buildOrgStructureSeed } from '@/services/mock/org-structure-seed';
import type { OrgStructureSnapshot } from '@/types/org-structure';

/** Prefixed `mock_` so juniors do not confuse this key with a Nest/DB store. */
const STORAGE_KEY = 'karvita_mock_org_structure_v2';

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function cloneSnapshot(
  data: OrgStructureSnapshot
): OrgStructureSnapshot {
  return structuredClone(data);
}

export function readOrgSnapshot(): OrgStructureSnapshot {
  if (!isBrowser()) return buildOrgStructureSeed();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = buildOrgStructureSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return cloneSnapshot(seed);
  }
  try {
    const parsed = JSON.parse(raw) as OrgStructureSnapshot;
    if (!parsed?.provinces || !Array.isArray(parsed.provinces)) {
      const seed = buildOrgStructureSeed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return cloneSnapshot(seed);
    }
    return {
      provinces: parsed.provinces ?? [],
      cities: parsed.cities ?? [],
      faculties: parsed.faculties ?? [],
      districts: parsed.districts ?? [],
      schools: parsed.schools ?? [],
      majors: parsed.majors ?? [],
    };
  } catch {
    const seed = buildOrgStructureSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return cloneSnapshot(seed);
  }
}

export function writeOrgSnapshot(data: OrgStructureSnapshot): void {
  if (!isBrowser()) return;
  if (!isMockApiMode()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
