import { describe, expect, it } from 'vitest';

import { mapNestUsersListPage } from '@/services/users.service';
import type { NestUserDto } from '@/types/nest-users';

const nestUser = {
  id: 'user-1',
  phone: '9386951413',
  firstName: 'Ali',
  lastName: 'Karimi',
  role: { id: 'role-1', name: 'student' },
  documentStatus: 'PENDING',
} as unknown as NestUserDto;

describe('mapNestUsersListPage', () => {
  it('maps Nest users and keeps hasNextPage', () => {
    const page = mapNestUsersListPage({
      data: [nestUser],
      hasNextPage: true,
    });
    expect(page.hasNextPage).toBe(true);
    expect(page.data[0]?.mobile).toBe('9386951413');
    expect(page.data[0]?.role).toBe('student');
    expect(page.data[0]?.docStatus).toBe('pending_admin');
  });
});
