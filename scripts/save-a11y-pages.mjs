import fs from 'fs/promises';
import { chromium } from 'playwright';

async function save(url, name) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  const html = await page.content();
  await fs.writeFile(`./test-results/${name}.html`, html);
  await page.screenshot({ path: `./test-results/${name}.png`, fullPage: true });
  await browser.close();
}

(async () => {
  const base = 'http://localhost:3000';
  try {
    await save(`${base}/auth/login`, 'debug-login');
    await save(`${base}/auth/admin-gate`, 'debug-admin-gate');
    console.log('Saved debug pages to test-results/');
  } catch (err) {
    console.error('Error saving pages', err);
    process.exit(1);
  }
})();
