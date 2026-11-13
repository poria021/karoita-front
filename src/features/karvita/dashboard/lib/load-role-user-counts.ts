import { IS_MOCK_MODE } from '@/lib/api-mode';
import {
  readMockUsers,
  subscribeMockAuthUsers,
} from '@/services/auth/mock/mock-auth.store';
import { mapNestAuthUser } from '@/services/auth/real/nest-auth-mappers';
import { usersApi } from '@/services/users/users.api';
import type { UserRole } from '@/types/auth';

import {
  tallyRolesFromList,
  type RoleUserCountsMap,
} from './role-user-counts';

/** سقف صفحات واقعی تا حلقه بی‌نهایت نشود (۵۰ × ۱۰۰ = ۵۰۰۰ کاربر). */
const MAX_REAL_PAGES = 50;
const REAL_PAGE_LIMIT = 100;

async function loadRealRoleUserCounts(): Promise<RoleUserCountsMap> {
  const roles: UserRole[] = [];
  let page = 1;

  for (let i = 0; i < MAX_REAL_PAGES; i += 1) {
    const raw = await usersApi.list({ page, limit: REAL_PAGE_LIMIT });
    const rows = Array.isArray(raw.data) ? raw.data : [];
    for (const row of rows) {
      try {
        roles.push(mapNestAuthUser(row).role);
      } catch {
        // ردیف معیوب را برای شمارش رد می‌کنیم.
      }
    }
    if (!raw.hasNextPage || rows.length === 0) break;
    page += 1;
  }

  return tallyRolesFromList(roles);
}

function loadMockRoleUserCounts(): RoleUserCountsMap {
  return tallyRolesFromList(readMockUsers().map((user) => user.role));
}

/** شمار کاربران به تفکیک نقش برای میز کار مدیر ارشد. */
export async function loadRoleUserCounts(): Promise<RoleUserCountsMap> {
  if (IS_MOCK_MODE) return loadMockRoleUserCounts();
  return loadRealRoleUserCounts();
}

/** در mock با تغییر store کاربران، کوئری داشبورد باطل شود. */
export function subscribeRoleUserCountsDirectory(
  listener: () => void
): () => void {
  if (!IS_MOCK_MODE) return () => undefined;
  return subscribeMockAuthUsers(listener);
}
