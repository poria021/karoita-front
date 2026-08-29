import { describe, expect, it } from 'vitest';

import {
  mapAdminsPage,
  mapNestAdminAccount,
  parseAdminsListResponse,
} from '@/services/admin-user-creation/real/admins.mappers';
import type { NestAdminDto } from '@/types/nest-admins';

const nestAdmin = (overrides: Partial<NestAdminDto> = {}): NestAdminDto => ({
  id: 'adm-1',
  fname: 'Ali',
  lname: 'Rezaei',
  phone: '09386951413',
  status: { id: 'st-1', name: 'active' },
  role: 'admin',
  createdAt: '2026-08-29T14:11:55.298Z',
  updatedAt: '2026-08-29T14:11:55.298Z',
  ...overrides,
});

describe('parseAdminsListResponse', () => {
  it('reads the Swagger envelope { data, hasNextPage }', () => {
    const parsed = parseAdminsListResponse({
      data: [nestAdmin()],
      hasNextPage: true,
    });
    expect(parsed.data).toHaveLength(1);
    expect(parsed.hasNextPage).toBe(true);
  });

  it('does not throw on empty payloads', () => {
    expect(parseAdminsListResponse(null)).toEqual({
      data: [],
      hasNextPage: false,
    });
  });
});

describe('mapNestAdminAccount', () => {
  it('maps fname/lname/phone and Nest role admin → assistant_admin', () => {
    expect(mapNestAdminAccount(nestAdmin())).toMatchObject({
      id: 'adm-1',
      firstName: 'Ali',
      lastName: 'Rezaei',
      mobile: '09386951413',
      role: 'assistant_admin',
      statusName: 'active',
      createdAt: '2026-08-29T14:11:55.298Z',
    });
  });

  it('maps Nest role superadmin → super_admin', () => {
    expect(mapNestAdminAccount(nestAdmin({ role: 'superadmin' }))?.role).toBe(
      'super_admin'
    );
  });

  it('drops rows without id', () => {
    expect(mapNestAdminAccount(nestAdmin({ id: '' }))).toBeNull();
  });
});

describe('mapAdminsPage', () => {
  it('filters unmapped rows and keeps hasNextPage', () => {
    const page = mapAdminsPage({
      data: [nestAdmin(), { fname: 'no-id' }],
      hasNextPage: false,
    });
    expect(page.data).toHaveLength(1);
    expect(page.hasNextPage).toBe(false);
  });
});
