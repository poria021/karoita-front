import { describe, expect, it } from 'vitest';

import { RouteService } from '@/services/route.service';
import { getModuleMeta } from '@/utils/moduleMeta';

describe('getModuleMeta', () => {
  it('uses internship submodule titles from student sidebar', () => {
    expect(
      getModuleMeta(RouteService.karvita.internshipSelection(1), 'student')
        .title
    ).toBe('کارورزی ۱');
    expect(
      getModuleMeta(RouteService.karvita.internshipSelection(3), 'student')
        .title
    ).toBe('کارورزی ۳');
  });

  it('uses apprenticeship submodule titles from skill_learner sidebar', () => {
    expect(
      getModuleMeta(
        RouteService.karvita.internshipSelection(1),
        'skill_learner'
      ).title
    ).toBe('کارآموزی ۱');
    expect(
      getModuleMeta(
        RouteService.karvita.internshipSelection(2),
        'skill_learner'
      ).title
    ).toBe('کارآموزی ۲');
  });
});
