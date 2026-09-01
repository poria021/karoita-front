import {
  fetchAllNestCities,
  fetchAllNestEducations,
  fetchAllNestSchools,
  fetchAllNestUniversities,
} from '@/services/admin-catalog/admin-catalog.api';
import {
  buildOrgDeleteBlockedSets,
  isDeleteBlockedWithSets,
  orgDeleteBlockedMessage,
  type OrgDeleteBlockedSets,
} from '@/services/org-structure/org-structure-delete-rules';
import {
  toOrgCity,
  toOrgDistrict,
  toOrgFaculty,
  toOrgSchool,
} from '@/services/org-structure/real/real-org-mappers';
import type { OrgStructureEntityKind } from '@/types/org-structure';

/**
 * آیا حذف استان/شهر/منطقه قفل شود — همان قاعدهٔ mock؛ Nest فلگ `canDelete` ندارد.
 * GET مدرسه اغلب `educationId` ندارد (`education: {}`)؛ قفل منطقه best-effort است.
 */
const DELETE_BLOCKED_TTL_MS = 30_000;

type Cache = {
  sets: OrgDeleteBlockedSets;
  staleSince: number;
};

let cache: Cache | null = null;
let inflight: Promise<OrgDeleteBlockedSets> | null = null;

export function flushRealDeleteBlockedCache(): void {
  cache = null;
  inflight = null;
}

async function loadRealDeleteBlockedSets(): Promise<OrgDeleteBlockedSets> {
  const [citiesRaw, districtsRaw, schoolsRaw, facultiesRaw] = await Promise.all(
    [
      fetchAllNestCities(),
      fetchAllNestEducations(),
      fetchAllNestSchools(),
      fetchAllNestUniversities(),
    ]
  );

  return buildOrgDeleteBlockedSets({
    provinces: [],
    majors: [],
    cities: citiesRaw.map(toOrgCity),
    districts: districtsRaw.map(toOrgDistrict),
    schools: schoolsRaw.map(toOrgSchool),
    faculties: facultiesRaw.map(toOrgFaculty),
  });
}

export async function getRealDeleteBlockedSets(options?: {
  force?: boolean;
}): Promise<OrgDeleteBlockedSets> {
  if (!options?.force) {
    if (
      cache &&
      cache.staleSince > 0 &&
      Date.now() - cache.staleSince < DELETE_BLOCKED_TTL_MS
    ) {
      return cache.sets;
    }
    if (inflight) return inflight;
  }

  const request = loadRealDeleteBlockedSets();
  if (!options?.force) inflight = request;

  try {
    const sets = await request;
    cache = { sets, staleSince: Date.now() };
    return sets;
  } finally {
    if (inflight === request) inflight = null;
  }
}

/** دفاع در عمق هنگام commit حذف؛ UI از قبل اکشن را پنهان می‌کند. */
export async function assertRealOrgDeleteAllowed(
  kind: OrgStructureEntityKind,
  id: string
): Promise<void> {
  if (kind !== 'province' && kind !== 'city' && kind !== 'district') return;

  try {
    const sets = await getRealDeleteBlockedSets({ force: true });
    if (!isDeleteBlockedWithSets(kind, id, sets)) return;
  } catch {
    return;
  }

  const message = orgDeleteBlockedMessage(kind);
  if (message) throw new Error(message);
}
