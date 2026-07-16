/**
 * Admin user listing DTO — shared by AdminService and the Better-Auth bridge.
 */

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  banned: boolean;
  banReason?: string;
  banExpires?: Date | null;
  accounts: string[];
  lastSignIn: Date | null;
  createdAt: Date;
  avatarUrl: string;
  role?: string;
}

export interface ListAdminUsersOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  role?: string;
  status?: string;
  email?: string;
  name?: string;
}

export interface ListAdminUsersResult {
  users: AdminUserListItem[];
  total: number;
}
