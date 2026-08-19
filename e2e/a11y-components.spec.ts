import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { RouteService } from '../src/services/route.service';
import { MOCK_SUPER_ADMIN_MOBILE } from '../src/services/auth/auth-mock-users';

async function expectNoSeriousAxeViolations(page: Page, include?: string) {
  let builder = new AxeBuilder({ page }).withTags([
    'wcag2a',
    'wcag2aa',
    'wcag21a',
    'wcag21aa',
  ]);
  if (include) {
    builder = builder.include(include);
  }
  const results = await builder.analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical'
  );
  expect(
    serious,
    serious.map((v) => `${v.id}: ${v.help}`).join('\n') || undefined
  ).toEqual([]);
}

test.describe('a11y components', () => {
  test('login form fields are labelled', async ({ page }) => {
    await page.goto(RouteService.auth.login());
    const mobile = page.locator('#login-mobile');
    await expect(mobile).toBeVisible({ timeout: 30_000 });
    await expect(page.getByLabel('شماره موبایل')).toBeVisible();
    await expectNoSeriousAxeViolations(page, 'main');
  });

  test('skip link is the first focusable control on the app shell', async ({
    page,
  }) => {
    await page.goto(RouteService.marketing.home());
    await page.evaluate((mobile) => {
      document.cookie = `karvita_mock_session=1; path=/`;
      const meta = JSON.stringify({
        token: 'mock.test',
        expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
      });
      document.cookie = `karvita_auth_session_meta=${meta}; path=/`;
      localStorage.setItem(
        'karvita-user-store',
        JSON.stringify({
          state: {
            activeUser: {
              id: 'mock-admin',
              mobile,
              firstName: '',
              lastName: '',
              role: 'super_admin',
              approved: true,
              docStatus: 'not_submitted',
              hasPassword: false,
            },
            isAuthenticated: true,
          },
        })
      );
    }, MOCK_SUPER_ADMIN_MOBILE);

    await page.goto(RouteService.karvita.adminDashboard());
    await expect(page.locator('main#karvita-main-content')).toBeVisible({
      timeout: 30_000,
    });

    await page.locator('body').press('Tab');
    const skip = page.getByRole('link', { name: 'پرش به محتوای اصلی' });
    await expect(skip).toBeFocused();
    await skip.press('Enter');
    await expect(page.locator('main#karvita-main-content')).toBeFocused();
  });
});
