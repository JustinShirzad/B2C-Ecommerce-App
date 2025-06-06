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

    test('Check if products load on Main page', async ({ page }) => {
        // Check if products are displayed
        const productListItem = page.locator('[data-testid="product-item"]');
        await expect(productListItem).toHaveCount(10);

        // Check if the first product is visible
        const firstProduct = productListItem.first();
        await expect(firstProduct).toBeVisible();

        // Check if the first product has the correct text
        await expect(page.locator('body')).toContainText('Femur Bone');
        await expect(page.locator('body')).toContainText('Anatomy');
        await expect(page.locator('body')).toContainText('A strong and sturdy femur bone, the perfect weapon.');
        await expect(page.locator('body')).toContainText('$157.40');
        await expect(page.locator('body')).toContainText('In Stock (1)');
    });

    test('Check if product details page loads correctly', async ({ page }) => {
        // Navigate to the product details page
        await page.getByText('JavaScript Book').click();

        // Wait for the product details page to load
        await page.waitForTimeout(3000);

        // Check if the product details page is displayed
        await expect(page.getByRole('heading', { name: 'JavaScript Book' })).toBeVisible();
        await expect(page.getByRole('main')).toContainText('$39.99');
        await page.goto('http://localhost:3000/products/js-book');
        await page.getByText('Learn modern JavaScript').click();
        await page.getByText('In Stock').click();
        await expect(page.getByRole('main')).toContainText('Product Specifications');
    });
});