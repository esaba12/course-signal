const { test, expect } = require('@playwright/test');

async function enterDemo(page) {
  await page.getByRole('button', { name: /Explore the UIUC demo/i }).click();
  await expect(page.locator('#entry-screen')).toHaveClass(/is-hidden/);
}

test('public entry screen offers UIUC demo, themes, and intake links', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Make the next planning conversation clearer/i })).toBeVisible();
  await expect(page.getByText(/University of Illinois Urbana-Champaign/i)).toBeVisible();
  await expect(page.locator('.theme-option')).toHaveCount(4);
  await page.locator('.theme-option[data-theme-id="indigo"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'indigo');
  await page.getByRole('button', { name: /What we need from you/i }).click();
  await expect(page.locator('#intake-dialog')).toBeVisible();
  await page.locator('[data-sample-file="Enrollment history.csv"]').click();
  await page.getByRole('button', { name: /Show quick findings/i }).click();
  await expect(page.locator('#intake-findings')).toBeVisible();
  await page.getByRole('button', { name: /Close document intake/i }).click();
  await page.getByRole('button', { name: /Request to join/i }).click();
  await page.locator('#request-name').fill('Alex Morgan');
  await page.locator('#request-organization').fill('Example University');
  await page.locator('#request-email').fill('alex@example.edu');
  await page.getByRole('button', { name: /Send request/i }).click();
  await expect(page.locator('#request-confirmation')).toBeVisible();
});

test('configured institution path renders historical signal, estimate, and backtest', async ({ page }) => {
  await page.goto('/');
  await enterDemo(page);
  await expect(page.getByRole('heading', { name: /Course Signal/i })).toBeVisible();

  const course = page.locator('#course-select');
  await expect(course).toBeEnabled();
  const configuredCourse = await course.inputValue();
  await expect(configuredCourse).not.toBe('');
  await expect(page.locator('#coverage')).toContainText('comparable terms');
  await expect(page.locator('#forecast')).toContainText('students');
  await expect(page.locator('#backtest')).toContainText('Observed');
  await expect(page.getByText(/Not a capacity or waitlist forecast/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /signal to investigate—not a recommendation to act/i })).toBeVisible();
  await expect(page.locator('#status')).toContainText('current-status');

  await expect(page.locator('#chart svg')).toBeVisible();
  await page.screenshot({ path: 'test-results/course-signal-configured-path.png', fullPage: true });
});

test('method explanation is accessible from the dashboard', async ({ page }) => {
  await page.goto('/');
  await enterDemo(page);
  await page.getByRole('button', { name: /How this works/i }).click();
  await expect(page.locator('#method')).toBeVisible();
  await expect(page.locator('#method')).toContainText('Unprovided capacity, fill rate, or waitlist size');
});

test('planner can compare, inspect, and save a course for review', async ({ page }) => {
  await page.goto('/');
  await enterDemo(page);
  await page.locator('#course-search').fill('ENG 201');
  await page.locator('[data-course="ENG 201"]').click();
  await expect(page.locator('.comparison-card')).toHaveCount(2);
  await page.locator('[data-review="ENG 201"]').click();
  await page.locator('#review-note').fill('Check the next offering against writing-program constraints.');
  await page.locator('#save-review').click();
  await expect(page.locator('#review-list')).toContainText('Check the next offering');
  await expect(page.locator('#review-count')).toContainText('1 saved');
  await page.locator('.bar[data-term-index="0"]').click();
  await expect(page.locator('#term-detail')).toContainText('2020-fa');
  await page.reload();
  await expect(page.locator('#review-list')).toContainText('Check the next offering');
  await expect(page).toHaveURL(/courses=MATH\+101%2CENG\+201/);
});
