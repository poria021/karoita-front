import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { RouteService } from '../src/services/route.service';
import {
  AUTH_MOCK_USERS,
  MOCK_SUPER_ADMIN_MOBILE,
} from '../src/services/auth/mock/auth-mock-users';

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

async function setMockAdminSession(page: Page): Promise<void> {
  await page.goto(RouteService.marketing.home());

  const admin = AUTH_MOCK_USERS.find(
    (user) => user.mobile === MOCK_SUPER_ADMIN_MOBILE
  );
  if (!admin) {
    throw new Error('AUTH_MOCK_USERS is missing the super_admin seed');
  }

  const meta = JSON.stringify({
    token: `mock.${admin.id}.${Date.now()}`,
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  });

  try {
    await page.context().addCookies([
      { name: 'karvita_mock_session', value: '1', url: page.url(), path: '/' },
      { name: 'karvita_auth_session_meta', value: meta, url: page.url(), path: '/' },
    ]);
  } catch {
    // addCookies گاهی روی همین origin رد می‌شود؛ در evaluate با document.cookie جبران می‌کنیم.
  }

  await page.evaluate((m) => {
    document.cookie = `karvita_mock_session=1; path=/`;
    document.cookie = `karvita_auth_session_meta=${encodeURIComponent(m)}; path=/`;
    try {
      sessionStorage.removeItem('karvita-user-store');
    } catch {
    }
  }, meta);
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
    await setMockAdminSession(page);

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
