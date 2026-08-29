import { describe, expect, it } from 'vitest';

import {
  NEST_ADMIN_STATUS_ACTIVE,
  NEST_ADMIN_STATUS_INACTIVE,
  toNestAdminPhone,
  toNestCreateAdminDto,
  toNestUpdateAdminDto,
} from './to-nest-admin-create';

describe('toNestAdminPhone', () => {
  it('prefixes a 10-digit national number with 0', () => {
    expect(toNestAdminPhone('9386951413')).toBe('09386951413');
  });

  it('keeps an already-prefixed 11-digit number', () => {
    expect(toNestAdminPhone('09386951413')).toBe('09386951413');
  });
});

describe('toNestCreateAdminDto', () => {
  const base = {
    firstName: 'علی',
    lastName: 'رضایی',
    mobile: '9386951413',
  };

  it('maps assistant_admin to Nest role admin', () => {
    expect(
      toNestCreateAdminDto({ ...base, role: 'assistant_admin' })
    ).toEqual({
      fname: 'علی',
      lname: 'رضایی',
      phone: '09386951413',
      role: 'admin',
    });
  });

  it('maps super_admin to Nest role superadmin', () => {
    expect(
      toNestCreateAdminDto({ ...base, role: 'super_admin' })
    ).toEqual({
      fname: 'علی',
      lname: 'رضایی',
      phone: '09386951413',
      role: 'superadmin',
    });
  });

  it('rejects organizational roles', () => {
    expect(() =>
      toNestCreateAdminDto({ ...base, role: 'central_organization' })
    ).toThrow(/ادمین/);
  });
});

describe('toNestUpdateAdminDto', () => {
  const base = {
    firstName: 'Ali',
    lastName: 'Rezaei',
    mobile: '9386951413',
    role: 'super_admin' as const,
    active: true,
  };

  it('sends Swagger PUT fields with status 2 when active', () => {
    expect(toNestUpdateAdminDto(base)).toEqual({
      fname: 'Ali',
      lname: 'Rezaei',
      phone: '09386951413',
      role: 'superadmin',
      status: NEST_ADMIN_STATUS_ACTIVE,
    });
  });

  it('sends status 1 when inactive', () => {
    expect(toNestUpdateAdminDto({ ...base, active: false }).status).toBe(
      NEST_ADMIN_STATUS_INACTIVE
    );
  });
});
