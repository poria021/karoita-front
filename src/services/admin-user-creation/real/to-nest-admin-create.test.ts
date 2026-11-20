import { describe, expect, it } from 'vitest';

import {
  NEST_ADMIN_STATUS_ACTIVE,
  NEST_ADMIN_STATUS_INACTIVE,
  nestPhonesMatch,
  toComparableIranMobile,
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

describe('nestPhonesMatch', () => {
  it('treats 09, +98, and 10-digit national as the same number', () => {
    expect(toComparableIranMobile('+989386951413')).toBe('9386951413');
    expect(nestPhonesMatch('09386951413', '9386951413')).toBe(true);
    expect(nestPhonesMatch('+989386951413', '9386951413')).toBe(true);
  });

  it('rejects a different national number', () => {
    expect(nestPhonesMatch('09386951413', '9445465457')).toBe(false);
  });
});

describe('toNestCreateAdminDto', () => {
  const base = {
    firstName: 'علی',
    lastName: 'رضایی',
    mobile: '9386951413',
    password: '',
  };

  it('maps assistant_admin to Nest role admin and includes password', () => {
    expect(
      toNestCreateAdminDto({
        ...base,
        role: 'assistant_admin',
        password: '12345678',
      })
    ).toEqual({
      fname: 'علی',
      lname: 'رضایی',
      phone: '09386951413',
      role: 'admin',
      password: '12345678',
    });
  });

  it('omits empty password so Nest keeps create optional', () => {
    expect(
      toNestCreateAdminDto({
        ...base,
        role: 'assistant_admin',
        password: '   ',
      })
    ).toEqual({
      fname: 'علی',
      lname: 'رضایی',
      phone: '09386951413',
      role: 'admin',
    });
  });

  it('rejects super_admin on create', () => {
    expect(() =>
      toNestCreateAdminDto({ ...base, role: 'super_admin' } as never)
    ).toThrow(/ادمین/);
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

  it('sends Nest StatusEnum active=1 when active', () => {
    expect(toNestUpdateAdminDto(base)).toEqual({
      fname: 'Ali',
      lname: 'Rezaei',
      phone: '09386951413',
      role: 'superadmin',
      status: NEST_ADMIN_STATUS_ACTIVE,
    });
    expect(NEST_ADMIN_STATUS_ACTIVE).toBe(1);
  });

  it('sends Nest StatusEnum inactive=2 when inactive', () => {
    expect(toNestUpdateAdminDto({ ...base, active: false }).status).toBe(
      NEST_ADMIN_STATUS_INACTIVE
    );
    expect(NEST_ADMIN_STATUS_INACTIVE).toBe(2);
  });
});
