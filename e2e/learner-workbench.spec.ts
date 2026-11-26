import { expect, test } from '@playwright/test';

import {
  approvedMockUser,
  LEARNER_ROLES,
  loginWithPassword,
  trackNestRequests,
} from './support/mock-auth';

for (const role of LEARNER_ROLES) {
  test(`${role}: workbench loads in mock mode and keeps the session`, async ({
    page,
  }) => {
    const nestRequests = trackNestRequests(page);

    await loginWithPassword(page, approvedMockUser(role).mobile);

    await expect(page).toHaveURL(/\/karvita\/dashboard/);
    await expect(page.getByRole('heading', { name: /خوش آمدید/ })).toBeVisible();
    // باکس‌های میز کار فراگیر (از وضعیت هفته‌ها ساخته می‌شوند).
    await expect(page.getByRole('heading', { name: /جزوه‌های درسی/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /وضعیت\s*هفته/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /روند نمره هفتگی/ })).toBeVisible();

    // رگرسیون: میز کار در mock نباید `open-course-selection` / `by-semester` را از Nest
    // واقعی بخواند (۴۰۱ ⇒ خروج از نشست ⇒ بازگشت به /auth/login).
    await expect(page).toHaveURL(/\/karvita\/dashboard/);
    expect(nestRequests).toEqual([]);
  });
}
