import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('link', { name: 'Femur Bone' }).first()).toBeVisible();
  await expect(page.locator('body')).toContainText('Femur Bone');
  await expect(page.locator('body')).toContainText('Anatomy');
  await expect(page.locator('body')).toContainText('A strong and sturdy femur bone, the perfect weapon.');
  await expect(page.locator('body')).toContainText('$157.40');
  await expect(page.locator('body')).toContainText('In Stock (1)');
});