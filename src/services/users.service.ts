import { requireNestTransport } from '@/services/require-nest-transport';
import { mapNestAuthUser } from '@/services/auth/real/nest-auth-mappers';
import { usersApi } from '@/services/users/users.api';
import type { User } from '@/types/auth';
import type {
  NestInfinityPaginationUserResponse,
  NestUpdateUserDto,
  NestUsersListQuery,
} from '@/types/nest-users';

export type UsersListPage = {
  data: User[];
  hasNextPage: boolean;
};

export function mapNestUsersListPage(
  raw: NestInfinityPaginationUserResponse
): UsersListPage {
  return {
    data: raw.data.map((row) => mapNestAuthUser(row)),
    hasNextPage: raw.hasNextPage,
  };
}

/**
 * Facade کاربران Nest — GET/PATCH/DELETE `/api/v1/users`.
 */
export const UsersService = {
  async list(query: NestUsersListQuery = {}, token?: string): Promise<UsersListPage> {
    requireNestTransport('UsersService.list');
    return mapNestUsersListPage(await usersApi.list(query, token));
  },

  async getById(id: string, token?: string): Promise<User> {
    requireNestTransport('UsersService.getById');
    return mapNestAuthUser(await usersApi.getById(id, token));
  },

  async update(
    id: string,
    body: NestUpdateUserDto,
    token?: string
  ): Promise<User> {
    requireNestTransport('UsersService.update');
    return mapNestAuthUser(await usersApi.update(id, body, token));
  },

  async remove(id: string, token?: string): Promise<void> {
    requireNestTransport('UsersService.remove');
    await usersApi.remove(id, token);
  },
};
