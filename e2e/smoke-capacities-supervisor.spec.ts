import { expect, test, type Page } from '@playwright/test';

import {
  MOCK_SUPERVISOR_MOBILE,
  MOCK_USER_PASSWORD,
} from '../src/services/auth/mock/auth-mock-users';
import { RouteService } from '../src/services/route.service';

async function fillMobile(page: Page, selector: string, mobile: string) {
  await page.locator(selector).click();
  await page.locator(selector).fill('');
  await page.locator(selector).pressSequentially(mobile, { delay: 15 });
}

async function loginAsMockSupervisor(page: Page): Promise<void> {
  await page.goto(RouteService.auth.login());
  const loginTab = page.getByRole('tab', { name: /ورود/ });
  if (await loginTab.count()) {
    await loginTab.click();
  }

  await expect(page.locator('#login-mobile')).toBeVisible({ timeout: 30_000 });
  await fillMobile(page, '#login-mobile', MOCK_SUPERVISOR_MOBILE);
  await page.locator('#login-password').fill(MOCK_USER_PASSWORD);
  await page.getByRole('button', { name: /ورود به سامانه/ }).click();

  await expect(page).toHaveURL(
    new RegExp(`${RouteService.karvita.dashboard().replace(/\//g, '\\/')}\\/?$`),
    { timeout: 30_000 }
  );
}

test.describe('supervisor capacities smoke', () => {
  test('organizational capacities module paints tabs and table', async ({
    page,
  }) => {
    await loginAsMockSupervisor(page);

    await page.goto(RouteService.karvita.organizationalCapacities());
    await expect(page).not.toHaveURL(/404|not-found/i);

    await expect(
      page.getByRole('tablist', { name: 'نوع ظرفیت پذیرش' })
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole('tab', { name: 'ظرفیت کارورزی' })
    ).toBeVisible();
    await expect(page.getByText('کل ظرفیت اعلام‌شده').first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('table')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /ثبت و ذخیره تغییرات ظرفیت‌ها/ })
    ).toBeVisible();
  });
});
