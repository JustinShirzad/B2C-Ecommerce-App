import { test, expect } from '@playwright/test';
import { seedData } from '../fixtures//seedHelper';

test.describe('Products E2E Tests', () => {

    const load = 'http://localhost:3000/';

    test.beforeAll(async ({ browser }) => {
        // Clear cookies once before all tests in this file
        const context = await browser.newContext();
        await seedData();
        await context.close();
    });

    test.beforeEach(async ({ page, browser }) => {
        // Navigate to the home page before each test
        const context = page.context();
        await context.clearCookies({ name: 'user-id' });
        await page.goto(load);
    });

    test('Sort products by category', async ({ page }) => {
        await page.getByRole('link', { name: 'Anatomy' }).click();

        // Check if products are displayed
        const productListItem = page.locator('[data-testid="product-item"]');
        await expect(productListItem).toHaveCount(3);
    });

    test('Search for products', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Search products...' }).click();
        await page.getByRole('textbox', { name: 'Search products...' }).fill('Wire');

        // Check if product is displayed
        const productListItem = page.locator('[data-testid="product-item"]');
        await expect(productListItem).toHaveCount(1);
        await expect(page.locator('body')).toContainText('Wireless Headphones');
    });
});
