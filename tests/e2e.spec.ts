import { test, expect } from '@playwright/test';

test('homepage loads cleanly without console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    consoleErrors.push(error.message);
  });

  const response = await page.goto('/');

  expect(response?.status()).toBe(200);

  // Wait for network idle to ensure scripts are executed
  await page.waitForLoadState('networkidle');

  expect(consoleErrors).toEqual([]);
});
