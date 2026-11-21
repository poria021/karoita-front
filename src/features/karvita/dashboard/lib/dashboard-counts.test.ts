import { describe, expect, it } from 'vitest';

import type { NestDashboardCountsDto } from '@/types/nest-users';

import {
  orgCountsFromDashboardCounts,
  roleCountsFromDashboardCounts,
} from './dashboard-counts';
import {
  buildRoleUserCountMetrics,
  sumRoleUserCounts,
} from './role-user-counts';
import { buildOrgStructureCountMetrics } from './org-structure-counts';

const dto: NestDashboardCountsDto = {
  places: {
    educationalDistricts: 12,
    cities: 40,
    provinces: 31,
    universities: 9,
    degrees: 25,
    schools: 310,
  },
  roles: {
    mentor: 8,
    trainee: 100,
    student: 250,
    schoolDistrict: 6,
    schoolAdmin: 30,
    teacher: 70,
    organizationCenter: 2,
    universityProvince: 5,
    university: 4,
  },
};

describe('dashboard-counts', () => {
  it('نگاشت مکان‌ها به تب‌های ساختار سازمانی', () => {
    expect(orgCountsFromDashboardCounts(dto)).toEqual({
      provinces: 31,
      cities: 40,
      districts: 12,
      schools: 310,
      majors: 25,
      faculties: 9,
    });
    const metrics = buildOrgStructureCountMetrics(
      orgCountsFromDashboardCounts(dto)
    );
    expect(metrics.map((m) => m.id)).toEqual([
      'provinces',
      'cities',
      'districts',
      'schools',
      'majors',
      'faculties',
    ]);
  });

  it('نگاشت نقش‌های بک‌اند به نقش‌های فرانت', () => {
    const counts = roleCountsFromDashboardCounts(dto);
    expect(counts).toMatchObject({
      student: 250,
      skill_learner: 100,
      supervisor_professor: 8,
      mentor_teacher: 70,
      school_principal: 30,
      regional_edu_admin: 6,
      faculty_role: 4,
      provincial_university: 5,
      central_organization: 2,
    });
    const metrics = buildRoleUserCountMetrics(counts);
    expect(metrics).toHaveLength(9);
    expect(sumRoleUserCounts(metrics)).toBe(475);
  });

  it('فیلد نیامده یا خراب → ۰', () => {
    const empty = orgCountsFromDashboardCounts(undefined);
    expect(Object.values(empty).every((n) => n === 0)).toBe(true);
    const broken = roleCountsFromDashboardCounts({
      places: dto.places,
      roles: { ...dto.roles, student: -3, trainee: Number.NaN },
    });
    expect(broken.student).toBe(0);
    expect(broken.skill_learner).toBe(0);
  });
});
