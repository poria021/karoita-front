import { describe, expect, it } from 'vitest';

import { withCatalogOptionalReports } from './with-catalog-optionals';

describe('withCatalogOptionalReports', () => {
  it('adds missing provincial extras as optional/inactive', () => {
    const [row] = withCatalogOptionalReports([
      {
        roleId: 'provincial_university',
        reports: [
          {
            slug: 'learners',
            access: 'default',
            status: 'active',
            enabled: true,
          },
          {
            slug: 'school-performance',
            access: 'optional',
            status: 'active',
            enabled: true,
          },
        ],
      },
    ]);

    expect(row?.reports).toEqual(
      expect.arrayContaining([
        {
          slug: 'school-performance',
          access: 'optional',
          status: 'active',
          enabled: true,
        },
        {
          slug: 'teachers',
          access: 'optional',
          status: 'inactive',
          enabled: false,
        },
        {
          slug: 'principals',
          access: 'optional',
          status: 'inactive',
          enabled: false,
        },
      ])
    );
  });

  it('does not override Nest status for extras already present', () => {
    const [row] = withCatalogOptionalReports([
      {
        roleId: 'faculty_role',
        reports: [
          {
            slug: 'teachers',
            access: 'optional',
            status: 'active',
            enabled: true,
          },
        ],
      },
    ]);

    expect(row?.reports.find((r) => r.slug === 'teachers')).toEqual({
      slug: 'teachers',
      access: 'optional',
      status: 'active',
      enabled: true,
    });
    expect(row?.reports.find((r) => r.slug === 'principals')).toEqual({
      slug: 'principals',
      access: 'optional',
      status: 'inactive',
      enabled: false,
    });
  });
});
