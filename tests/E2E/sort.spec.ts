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
        await page.getByRole('link', { name: 'Anatomy' }).first().click();

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

    test('Sort products by price (Asc)', async ({ page }) => {
        await page.getByRole('combobox').selectOption('price-asc');
        await page.goto('http://localhost:3000/?sort=price-asc');

        const cheapestItem = page.locator('[data-testid="product-item"]').nth(0);
        const secondCheapestItem = page.locator('[data-testid="product-item"]').nth(1);

        // Extract price text from both items
        const cheapestPriceText = await cheapestItem.locator('text=/\\$[\\d,]+\\.\\d{2}/').textContent();
        const secondCheapestPriceText = await secondCheapestItem.locator('text=/\\$[\\d,]+\\.\\d{2}/').textContent();

        // Convert price text to numbers (remove $ and convert to float)
        const cheapestPrice = parseFloat(cheapestPriceText!.replace('$', '').replace(',', ''));
        const secondCheapestPrice = parseFloat(secondCheapestPriceText!.replace('$', '').replace(',', ''));

        // Verify that the first item is cheaper than or equal to the second item
        expect(cheapestPrice).toBeLessThanOrEqual(secondCheapestPrice);

        // Additional verification: check that URL contains sort parameter
        await expect(page).toHaveURL(/sort=price-asc/);

        console.log(`Cheapest item price: $${cheapestPrice}`);
        console.log(`Second cheapest item price: $${secondCheapestPrice}`);
    });

    test('Sort products by price (Desc)', async ({ page }) => {
        await page.getByRole('combobox').selectOption('price-desc');
        await page.goto('http://localhost:3000/?sort=price-desc');

        const mostExpensiveItem = page.locator('[data-testid="product-item"]').nth(0);
        const secondMostExpensiveItem = page.locator('[data-testid="product-item"]').nth(1);

        // Extract price text from both items
        const mostExpensivePriceText = await mostExpensiveItem.locator('text=/\\$[\\d,]+\\.\\d{2}/').textContent();
        const secondMostExpensivePriceText = await secondMostExpensiveItem.locator('text=/\\$[\\d,]+\\.\\d{2}/').textContent();

        // Convert price text to numbers (remove $ and convert to float)
        const mostExpensivePrice = parseFloat(mostExpensivePriceText!.replace('$', '').replace(',', ''));
        const secondMostExpensivePrice = parseFloat(secondMostExpensivePriceText!.replace('$', '').replace(',', ''));

        // Verify that the first item is more expensive than or equal to the second item
        expect(mostExpensivePrice).toBeGreaterThanOrEqual(secondMostExpensivePrice);

        // Additional verification: check that URL contains sort parameter
        await expect(page).toHaveURL(/sort=price-desc/);

        console.log(`Most expensive item price: $${mostExpensivePrice}`);
        console.log(`Second most expensive item price: $${secondMostExpensivePrice}`);
    });

    test('Sort products by name (A-Z)', async ({ page }) => {
        await page.getByRole('combobox').selectOption('name-asc');
        await page.goto('http://localhost:3000/?sort=name-asc');

        const firstItem = page.locator('[data-testid="product-item"]').nth(0);
        const secondItem = page.locator('[data-testid="product-item"]').nth(1);

        // Extract names from both items
        const firstName = await firstItem.locator('h3').textContent();
        const secondName = await secondItem.locator('h3').textContent();

        // Verify that the first name comes before the second name alphabetically
        expect(firstName!.localeCompare(secondName!)).toBeLessThanOrEqual(0);

        // Additional verification: check that URL contains sort parameter
        await expect(page).toHaveURL(/sort=name-asc/);

        console.log(`First item name: ${firstName}`);
        console.log(`Second item name: ${secondName}`);
    });

    test('Sort products by name (Z-A)', async ({ page }) => {
        await page.getByRole('combobox').selectOption('name-desc');
        await page.goto('http://localhost:3000/?sort=name-desc');

        const firstItem = page.locator('[data-testid="product-item"]').nth(0);
        const secondItem = page.locator('[data-testid="product-item"]').nth(1);

        // Extract names from both items
        const firstName = await firstItem.locator('h3').textContent();
        const secondName = await secondItem.locator('h3').textContent();

        // Verify that the first name comes after the second name alphabetically
        expect(firstName!.localeCompare(secondName!)).toBeGreaterThanOrEqual(0);

        // Additional verification: check that URL contains sort parameter
        await expect(page).toHaveURL(/sort=name-desc/);

        console.log(`First item name: ${firstName}`);
        console.log(`Second item name: ${secondName}`);
    });

    test('Sort products by stock (Low to High)', async ({ page }) => {
        await page.getByRole('combobox').selectOption('stock-asc');
        await page.goto('http://localhost:3000/?sort=stock-asc');

        const firstItem = page.locator('[data-testid="product-item"]').nth(0);
        const secondItem = page.locator('[data-testid="product-item"]').nth(1);

        // Extract stock text from both items
        const firstStockText = await firstItem.locator('text=/Out of Stock/').textContent();
        const secondStockText = await secondItem.locator('text=/In Stock \\(\\d+\\)/').textContent();

        // Verify that the first item is out of stock and the second item is in stock
        await expect(firstStockText).toContain('Out of Stock');
        await expect(secondStockText).toMatch(/In Stock \(\d+\)/);
    });

    test('Sort products by stock (High to Low)', async ({ page }) => {
        await page.getByRole('combobox').selectOption('stock-desc');
        await page.goto('http://localhost:3000/?sort=stock-desc');

        const firstItem = page.locator('[data-testid="product-item"]').nth(0);
        const secondItem = page.locator('[data-testid="product-item"]').nth(1);

        // Extract stock text from both items (handle both in stock and out of stock)
        const firstStockText = await firstItem.locator('text=/In Stock \\(\\d+\\)|Out of Stock/').textContent();
        const secondStockText = await secondItem.locator('text=/In Stock \\(\\d+\\)|Out of Stock/').textContent();

        // Parse stock numbers
        const parseStock = (stockText: string | null): number => {
            if (!stockText || stockText.includes('Out of Stock')) {
                return 0;
            }
            const match = stockText.match(/In Stock \((\d+)\)/);
            return match ? parseInt(match[1]) : 0;
        };

        const firstStockNumber = parseStock(firstStockText);
        const secondStockNumber = parseStock(secondStockText);

        // Verify that the first item has higher or equal stock than the second item
        expect(firstStockNumber).toBeGreaterThanOrEqual(secondStockNumber);

        // Additional verification: check that URL contains sort parameter
        await expect(page).toHaveURL(/sort=stock-desc/);

        console.log(`First item stock: ${firstStockNumber}`);
        console.log(`Second item stock: ${secondStockNumber}`);
    });
});
