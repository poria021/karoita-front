import { expect, test } from '@playwright/test';

import { RouteService } from '../src/services/route.service';
import {
  approvedMockUser,
  type LearnerRole,
  loginWithPassword,
  trackNestRequests,
} from './support/mock-auth';

/** عنوان صفحهٔ سطح ۱: دانشجو «کارورزی»، مهارت‌آموز «کارآموزی». */
const LEVEL_ONE_TITLE: Record<LearnerRole, RegExp> = {
  student: /کارورزی\s*۱/,
  skill_learner: /کارآموزی\s*۱/,
};

for (const role of ['student', 'skill_learner'] as const) {
  test(`${role}: internship selection route opens the level page`, async ({
    page,
  }) => {
    const nestRequests = trackNestRequests(page);

    await loginWithPassword(page, approvedMockUser(role).mobile);
    await page.goto(RouteService.karvita.internshipSelection());

    await expect(page).toHaveURL(/\/karvita\/internships\/1$/);
    await expect(
      page.getByRole('heading', { name: LEVEL_ONE_TITLE[role] })
    ).toBeVisible();
    expect(nestRequests).toEqual([]);
  });
}
