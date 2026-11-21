import { describe, expect, it } from 'vitest';

import { orgUnitForWelcome, welcomeRoleOrgLine } from './welcome-identity';

describe('welcome-identity', () => {
  it('استاد راهنما دانشکده را برمی‌گرداند', () => {
    expect(
      orgUnitForWelcome({
        role: 'supervisor_professor',
        college: ['دانشکده فنی'],
        school: ['مدرسه الف'],
      })
    ).toBe('دانشکده فنی');
  });

  it('مدیر مدرسه نام مدرسه را برمی‌گرداند', () => {
    expect(
      orgUnitForWelcome({
        role: 'school_principal',
        school: ['هنرستان شهید بهشتی'],
        district: ['ناحیه ۱'],
      })
    ).toBe('هنرستان شهید بهشتی');
  });

  it('خط نقش · واحد را می‌سازد', () => {
    expect(
      welcomeRoleOrgLine('supervisor_professor', {
        college: ['دانشکده فنی'],
      })
    ).toBe('استاد راهنما · دانشکده فنی');
  });

  it('بدون واحد فقط نقش را می‌گذارد', () => {
    expect(welcomeRoleOrgLine('super_admin', {})).toBe('مدیر ارشد');
  });
});
