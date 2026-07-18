import type { MockAuthUserRecord } from '@/services/mock/auth-mock-users';

export type MockAuthIndexes = {
  byMobile: Map<string, MockAuthUserRecord>;
  byId: Map<string, MockAuthUserRecord>;
};

/** O(n) rebuild — call after every successful users write. */
export function buildMockAuthIndexes(
  users: readonly MockAuthUserRecord[]
): MockAuthIndexes {
  const byMobile = new Map<string, MockAuthUserRecord>();
  const byId = new Map<string, MockAuthUserRecord>();
  for (const user of users) {
    byMobile.set(user.mobile, user);
    byId.set(user.id, user);
  }
  return { byMobile, byId };
}

export function getMockUserByMobile(
  indexes: MockAuthIndexes,
  mobile: string
): MockAuthUserRecord | undefined {
  return indexes.byMobile.get(mobile);
}

export function getMockUserById(
  indexes: MockAuthIndexes,
  id: string
): MockAuthUserRecord | undefined {
  return indexes.byId.get(id);
}
