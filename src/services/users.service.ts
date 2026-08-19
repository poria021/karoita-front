import { requireNestTransport } from '@/services/require-nest-transport';
import { mapNestAuthUser } from '@/services/auth/nest-auth-mappers';
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

function mapList(raw: NestInfinityPaginationUserResponse): UsersListPage {
  return {
    data: raw.data.map((row) => mapNestAuthUser(row)),
    hasNextPage: raw.hasNextPage,
  };
}

/**
 * Nest Users facade — https://backenddev.darkube.ir/docs#/ Users
 *
 * - GET    /api/v1/users
 * - GET    /api/v1/users/{id}
 * - PATCH  /api/v1/users/{id}
 * - DELETE /api/v1/users/{id}
 */
export const UsersService = {
  async list(query: NestUsersListQuery = {}, token?: string): Promise<UsersListPage> {
    requireNestTransport('UsersService.list');
    return mapList(await usersApi.list(query, token));
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
