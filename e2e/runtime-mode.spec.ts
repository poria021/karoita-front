import { expect, test } from '@playwright/test';

test('e2e server runs the app in mock API mode', async ({ request }) => {
  const response = await request.get('/runtime-config.js');
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain('"apiMode":"mock"');
});
