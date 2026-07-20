const { test, expect } = require('@playwright/test');

test('CS 225 judge path renders historical signal, estimate, and backtest', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /UIUC CS Course Signal/i })).toBeVisible();

  const course = page.locator('#course-select');
  await expect(course).toBeEnabled();
  await course.selectOption('CS 225');
  await expect(page.locator('#coverage')).toContainText('comparable terms');
  await expect(page.locator('#forecast')).toContainText('students');
  await expect(page.locator('#backtest')).toContainText('Observed');
  await expect(page.getByText(/Not a capacity or waitlist forecast/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /signal to investigate—not a recommendation to act/i })).toBeVisible();
  await expect(page.locator('#status')).toContainText('No verified cached Course Explorer snapshot');

  await expect(page.locator('#chart svg')).toBeVisible();
  await page.screenshot({ path: 'test-results/cs-225-judge-path.png', fullPage: true });
});

test('method explanation is accessible from the dashboard', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /How this works/i }).click();
  await expect(page.locator('#method')).toBeVisible();
  await expect(page.locator('#method')).toContainText('Seats, fill rate, or waitlist size');
});
