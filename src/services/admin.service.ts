import { isMockApiMode } from '@/lib/api-mode';
import { AUTH_MOCK_USERS } from '@/services/mock/auth-mock-users';
import type {
  AdminUserListItem,
  ListAdminUsersOptions,
  ListAdminUsersResult,
} from '@/types/admin';

/**
 * Admin user listing facade (rule 40).
 * UI / API routes must call this — never import Drizzle or Better-Auth admin
 * helpers directly from `utils/` or feature code.
 */

const IS_MOCK_MODE = isMockApiMode();

export type { AdminUserListItem, ListAdminUsersOptions, ListAdminUsersResult };

function mapMockUsersToAdminList(): AdminUserListItem[] {
  return AUTH_MOCK_USERS.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: `${user.mobile}@mock.karvita.local`,
    verified: true,
    banned: false,
    banReason: '',
    banExpires: null,
    accounts: ['credential'],
    lastSignIn: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    avatarUrl: '',
    role: user.role,
  }));
}

function applyListFilters(
  users: AdminUserListItem[],
  options: ListAdminUsersOptions
): AdminUserListItem[] {
  let filtered = [...users];

  if (options.role) {
    filtered = filtered.filter((user) => user.role === options.role);
  }
  if (options.status === 'banned') {
    filtered = filtered.filter((user) => user.banned);
  } else if (options.status === 'active') {
    filtered = filtered.filter((user) => !user.banned);
  }
  if (options.email) {
    const needle = options.email.toLowerCase();
    filtered = filtered.filter((user) => user.email.toLowerCase().includes(needle));
  }
  if (options.name) {
    const needle = options.name.toLowerCase();
    filtered = filtered.filter((user) => user.name.toLowerCase().includes(needle));
  }

  if (options.sortBy) {
    const direction = options.sortDirection === 'desc' ? -1 : 1;
    const key = options.sortBy as keyof AdminUserListItem;
    filtered.sort((a, b) => {
      const left = a[key];
      const right = b[key];
      if (left == null && right == null) return 0;
      if (left == null) return -1 * direction;
      if (right == null) return 1 * direction;
      if (left < right) return -1 * direction;
      if (left > right) return 1 * direction;
      return 0;
    });
  }

  return filtered;
}

export const AdminService = {
  async listUsers(options: ListAdminUsersOptions = {}): Promise<ListAdminUsersResult> {
    if (IS_MOCK_MODE) {
      const filtered = applyListFilters(mapMockUsersToAdminList(), options);
      const offset = options.offset ?? 0;
      const limit = options.limit ?? 10;
      return {
        users: filtered.slice(offset, offset + limit),
        total: filtered.length,
      };
    }

    const { listBetterAuthAdminUsers } = await import('@/lib/better-auth-admin-users');
    return listBetterAuthAdminUsers(options);
  },
};
