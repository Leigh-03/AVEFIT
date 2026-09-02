import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('landing page presents the package and has no detectable accessibility violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Exercise assets, ready to ship.' })).toBeVisible();
  await expect(page.getByText('302', { exact: true })).toBeVisible();
  await expect(page.locator('img').first()).toHaveAttribute('width', '512');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('keyboard skip navigation works', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit follows the host full-keyboard-access preference.');
  await page.goto('./');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
});

test('copy control writes the install command', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit does not expose clipboard permissions to Playwright.');
  await page.goto('./');
  const copy = page.locator('[data-copy-text]').first();
  await copy.click();
  await expect(copy).toContainText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('npm install @bryllim/workout-guide');
});

test('gallery search and filters persist in the URL', async ({ page }) => {
  await page.goto('./exercises/');
  const search = page.getByRole('searchbox');
  await search.fill('doorway row');
  await expect(page.locator('[data-exercise-card]:visible')).toHaveCount(1);
  await expect(page.locator('#result-count')).toContainText('1 exercise found');
  await expect(page).toHaveURL(/q=doorway\+row/);
  await page.reload();
  await expect(search).toHaveValue('doorway row');
  await expect(page.locator('[data-exercise-card] img').first()).toHaveAttribute('loading', 'lazy');
});

test('detail page exposes three frames and download links', async ({ page }) => {
  await page.goto('./exercises/push-up/');
  await expect(page.getByRole('heading', { name: 'Push-up', exact: true })).toBeVisible();
  await expect(page.locator('.frame-card')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Download' })).toHaveCount(3);
  await expect(page.getByText('assets/push-up/frame-1.svg', { exact: true })).toBeVisible();
});

test('reduced motion disables hero blur and translation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const heroItem = page.locator('.stagger-item').first();
  await expect(heroItem).toHaveCSS('filter', 'none');
  await expect(heroItem).toHaveCSS('transform', 'none');
});

test('mobile layout reflows without horizontal overflow', async ({ page }) => {
  await page.goto('./exercises/');
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
  await expect(page.getByRole('searchbox')).toHaveCSS('font-size', '16px');
});
