import { beforeEach, describe, expect, it, vi } from 'vitest';

import { adminsApi } from '@/services/admin-user-creation/real/admins.api';

const getJson = vi.fn();
const postJson = vi.fn();

vi.mock('@/services/api-client', () => ({
  apiClient: {
    getJson: (...args: unknown[]) => getJson(...args),
    postJson: (...args: unknown[]) => postJson(...args),
  },
}));

const nestRow = {
  id: 'adm-1',
  fname: 'Ali',
  lname: 'Rezaei',
  phone: '09386951413',
  status: { id: 'st-1', name: 'active' },
  role: 'admin',
  createdAt: '2026-08-29T14:11:55.298Z',
  updatedAt: '2026-08-29T14:11:55.298Z',
};

describe('adminsApi', () => {
  beforeEach(() => {
    getJson.mockReset();
    postJson.mockReset();
  });

  it('GETs v1/admin/admins with page and limit', async () => {
    getJson.mockResolvedValue({ data: [nestRow], hasNextPage: true });

    const page = await adminsApi.list({ page: 1, limit: 20 });

    expect(getJson).toHaveBeenCalledWith(
      'v1/admin/admins',
      undefined,
      expect.objectContaining({
        searchParams: { page: 1, limit: 20 },
      })
    );
    expect(page.data[0]?.id).toBe('adm-1');
    expect(page.data[0]?.role).toBe('assistant_admin');
    expect(page.hasNextPage).toBe(true);
  });

  it('GETs v1/admin/admins/{id}', async () => {
    getJson.mockResolvedValue(nestRow);

    const admin = await adminsApi.getById('adm-1');

    expect(getJson).toHaveBeenCalledWith(
      'v1/admin/admins/adm-1',
      undefined
    );
    expect(admin.firstName).toBe('Ali');
  });

  it('POSTs create body to v1/admin/admins', async () => {
    postJson.mockResolvedValue(nestRow);

    await adminsApi.create({
      fname: 'Ali',
      lname: 'Rezaei',
      phone: '09386951413',
      role: 'admin',
    });

    expect(postJson).toHaveBeenCalledWith(
      'v1/admin/admins',
      {
        fname: 'Ali',
        lname: 'Rezaei',
        phone: '09386951413',
        role: 'admin',
      },
      undefined
    );
  });
});
