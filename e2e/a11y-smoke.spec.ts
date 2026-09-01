import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import {
  AUTH_MOCK_USERS,
  MOCK_SUPER_ADMIN_MOBILE,
} from '../src/services/auth/mock/auth-mock-users';
import { RouteService } from '../src/services/route.service';

/**
 * دود axe: یافتهٔ serious/critical روی مارکتینگ، ورود عمومی، و یک شل داشبورد باید خالی بماند.
 */

function mockSuperAdminSessionMeta(): string {
  const admin = AUTH_MOCK_USERS.find(
    (user) => user.mobile === MOCK_SUPER_ADMIN_MOBILE
  );
  if (!admin) {
    throw new Error('AUTH_MOCK_USERS is missing the super_admin seed');
  }
  return JSON.stringify({
    token: `mock.${admin.id}.${Date.now()}`,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  });
}

async function setMockSessionCookies(page: Page): Promise<void> {
  await page.goto(RouteService.marketing.home());
  const meta = mockSuperAdminSessionMeta();

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

async function expectNoSeriousAxeViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical'
  );

  expect(
    serious,
    serious.map((v) => `${v.id}: ${v.help}`).join('\n') || undefined
  ).toEqual([]);
}

test.describe('a11y smoke', () => {
  test('marketing home has no serious axe violations', async ({ page }) => {
    await page.goto(RouteService.marketing.home());
    await expect(
      page.getByRole('heading', { name: 'کارویتا' })
    ).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test('login shell has no serious axe violations', async ({ page }) => {
    await page.goto(RouteService.auth.login());
    await expect(page.locator('#login-mobile')).toBeVisible({
      timeout: 30_000,
    });
    await expectNoSeriousAxeViolations(page);
  });

  test('dashboard exposes skip link and main landmark', async ({ page }) => {
    await setMockSessionCookies(page);
    await page.goto(RouteService.karvita.adminDashboard());

    const skip = page.getByRole('link', { name: 'پرش به محتوای اصلی' });
    const main = page.locator('main#karvita-main-content');

    await expect(skip).toBeAttached({ timeout: 30_000 });
    await expect(main).toBeVisible({ timeout: 30_000 });
    await expect(main).toHaveAttribute('tabindex', '-1');

    await skip.focus();
    await expect(skip).toBeVisible();
    await skip.press('Enter');
    await expect(main).toBeFocused();

    await expectNoSeriousAxeViolations(page);
  });
});
