import { describe, expect, it } from 'vitest';

import {
  orgAccountRequiresCity,
  orgAccountRequiresCollege,
  orgAccountRequiresDistrict,
  orgAccountRequiresProvince,
} from './roleFieldStrategy';

describe('orgAccountRequires*', () => {
  it('derives province/college/city/district from ROLE_FIELD_STRATEGY', () => {
    expect(orgAccountRequiresProvince('provincial_university')).toBe(true);
    expect(orgAccountRequiresCollege('provincial_university')).toBe(false);

    expect(orgAccountRequiresProvince('faculty_role')).toBe(true);
    expect(orgAccountRequiresCollege('faculty_role')).toBe(true);
    expect(orgAccountRequiresCity('faculty_role')).toBe(false);

    expect(orgAccountRequiresProvince('regional_edu_admin')).toBe(true);
    expect(orgAccountRequiresCity('regional_edu_admin')).toBe(true);
    expect(orgAccountRequiresDistrict('regional_edu_admin')).toBe(true);

    expect(orgAccountRequiresProvince('central_organization')).toBe(false);
    expect(orgAccountRequiresProvince('')).toBe(false);
  });
});
