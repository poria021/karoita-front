import { describe, expect, it } from 'vitest';

import { RouteService } from '@/services/route.service';

import {
  getModuleEmptyCopy,
  getSyllabusTermSettingsHref,
} from './moduleDiscoverability';

describe('getModuleEmptyCopy', () => {
  it('returns institutional copy for each live empty kind', () => {
    expect(getModuleEmptyCopy('org_structure').title).toBeTruthy();
    expect(getModuleEmptyCopy('onboarding_list').actionLabel).toContain(
      'فیلتر'
    );
    expect(getModuleEmptyCopy('syllabus_courses').actionLabel).toContain(
      'تنظیمات'
    );
    expect(getModuleEmptyCopy('syllabus_weeks').description.length).toBeGreaterThan(
      10
    );
  });
});

describe('getSyllabusTermSettingsHref', () => {
  it('delegates to RouteService', () => {
    expect(getSyllabusTermSettingsHref()).toBe(
      RouteService.karvita.syllabusTermSettings()
    );
  });
});
