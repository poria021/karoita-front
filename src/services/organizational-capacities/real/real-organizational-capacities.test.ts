import { beforeEach, describe, expect, it, vi } from 'vitest';

import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import {
  getRealOrganizationalCapacities,
  loadRealCapacityCatalog,
  submitRealOrganizationalCapacities,
} from '@/services/organizational-capacities/real/real-organizational-capacities';

vi.mock('@/services/admin-catalog/admin-catalog.api', () => ({
  adminCatalogApi: {
    listSemestersAll: vi.fn(),
    getAcademicSettings: vi.fn(),
    listProfessorCapacities: vi.fn(),
    createProfessorCapacities: vi.fn(),
    updateProfessorCapacities: vi.fn(),
  },
}));

const api = vi.mocked(adminCatalogApi);

const SEMESTER = {
  id: 'sem-1',
  season: 'one' as const,
  academicYears: '1404-1405',
  structure: 'semester' as const,
  lessons: [
    { id: 'les-1', title: 'کارورزی ۱' },
    { id: 'les-2', title: 'کارورزی ۲' },
  ],
};

describe('real organizational capacities — API call pattern', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.listSemestersAll.mockResolvedValue([SEMESTER]);
    api.getAcademicSettings.mockResolvedValue({ generalProfessorCapacity: 12 });
    api.listProfessorCapacities.mockResolvedValue([
      {
        professorId: 'prof-1',
        lessonId: 'les-1',
        semesterId: 'sem-1',
        days: [0],
        capacity: 5,
      },
    ]);
    api.createProfessorCapacities.mockResolvedValue(null);
    api.updateProfessorCapacities.mockResolvedValue(null);
  });

  it('loads the catalog with exactly one semesters_all and one settings call', async () => {
    const catalog = await loadRealCapacityCatalog('internship');

    expect(api.listSemestersAll).toHaveBeenCalledTimes(1);
    expect(api.getAcademicSettings).toHaveBeenCalledTimes(1);
    expect(api.listProfessorCapacities).not.toHaveBeenCalled();
    expect(catalog.maxCapacity).toBe(12);
    expect(catalog.terms).toHaveLength(1);
  });

  it('with a catalog, the snapshot needs a single semester-wide GET (no lessonId)', async () => {
    const catalog = await loadRealCapacityCatalog('internship');
    api.listSemestersAll.mockClear();
    api.getAcademicSettings.mockClear();

    const snapshot = await getRealOrganizationalCapacities(
      { kind: 'internship', termId: 'sem-1', catalog },
      'prof-1'
    );

    expect(api.listSemestersAll).not.toHaveBeenCalled();
    expect(api.getAcademicSettings).not.toHaveBeenCalled();
    expect(api.listProfessorCapacities).toHaveBeenCalledTimes(1);
    expect(api.listProfessorCapacities).toHaveBeenCalledWith({
      semesterId: 'sem-1',
    });
    expect(snapshot.courses.map((c) => [c.id, c.total, c.existsOnServer])).toEqual([
      ['les-1', 5, true],
      ['les-2', 0, false],
    ]);
  });

  it('submit = POST/PUT then exactly one GET; no pre-read, no catalog reload', async () => {
    const catalog = await loadRealCapacityCatalog('internship');
    api.listSemestersAll.mockClear();
    api.getAcademicSettings.mockClear();

    await submitRealOrganizationalCapacities(
      {
        kind: 'internship',
        termId: 'sem-1',
        catalog,
        maxCapacity: 12,
        courses: [
          { courseId: 'les-1', total: 6, selectedDays: ['sat'], existsOnServer: true },
          { courseId: 'les-2', total: 4, selectedDays: ['sun'], existsOnServer: false },
        ],
      },
      'prof-1'
    );

    expect(api.updateProfessorCapacities).toHaveBeenCalledTimes(1);
    expect(api.createProfessorCapacities).toHaveBeenCalledTimes(1);
    expect(api.listProfessorCapacities).toHaveBeenCalledTimes(1);
    expect(api.listSemestersAll).not.toHaveBeenCalled();
    expect(api.getAcademicSettings).not.toHaveBeenCalled();
  });

  it('never POSTs or PUTs an empty array', async () => {
    const catalog = await loadRealCapacityCatalog('internship');

    await submitRealOrganizationalCapacities(
      {
        kind: 'internship',
        termId: 'sem-1',
        catalog,
        maxCapacity: 12,
        courses: [
          { courseId: 'les-2', total: 0, selectedDays: [], existsOnServer: false },
        ],
      },
      'prof-1'
    );

    expect(api.createProfessorCapacities).not.toHaveBeenCalled();
    expect(api.updateProfessorCapacities).not.toHaveBeenCalled();
  });
});
