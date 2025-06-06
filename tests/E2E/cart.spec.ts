import { test, expect } from '@playwright/test';
import { seedData } from '../fixtures//seedHelper';

test.describe('Cart and Checkout E2E Tests', () => {

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
        await page.context().addCookies([
            {
                name: 'user-id',
                value: 'test-user-id',
                domain: 'localhost',
                path: '/',
                httpOnly: true,
                sameSite: 'Lax'
            }
        ]);
        await page.goto(load);
    });

    test('Add and subtract items from the cart', async ({ page }) => {
        // Navigate to the cart page
        await page.goto(load + '/cart');

        // Wait for cart to load
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);

        // Test Plant Pot Set
        const plantPotItem = page.getByRole('listitem').filter({ hasText: 'Plant Pot SetSet of 3 ceramic' });
        await expect(plantPotItem.getByTestId('cart-item')).toBeVisible();
        await expect(plantPotItem.locator('[data-testid="quantity-display"]')).toHaveText('Qty: 2');

        // Increase Plant Pot Set quantity
        await page.getByRole('listitem').filter({ hasText: 'Plant Pot SetSet of 3 ceramic' }).getByLabel('Increase quantity').click();
        await expect(plantPotItem.locator('[data-testid="quantity-display"]')).toHaveText('Qty: 3');

        // Decrease Plant Pot Set quantity
        await page.getByRole('listitem').filter({ hasText: 'Plant Pot SetSet of 3 ceramic' }).getByLabel('Decrease quantity').click();
        await expect(plantPotItem.locator('[data-testid="quantity-display"]')).toHaveText('Qty: 2');
    });

    test('Remove items from the cart', async ({ page }) => {
        // Navigate to the cart page
        await page.goto(load + '/cart');

        const plantPotItem = page.getByRole('listitem').filter({ hasText: 'Plant Pot SetSet of 3 ceramic' });
        await expect(plantPotItem.getByTestId('cart-item')).toBeVisible();

        // Remove Plant Pot Set from the cart
        await page.getByRole('listitem').filter({ hasText: 'Plant Pot SetSet of 3 ceramic' }).getByLabel('Remove item').click();

        // Check that the item is no longer visible
        await expect(plantPotItem).not.toBeVisible({timeout: 5000});
    });

    test('Add new items to the cart', async ({ page }) => {
        // Navigate to a product page
        await page.goto(load + '/products/js-book');

        await page.waitForTimeout(3000);

        // Add a new item to the cart
        await page.getByRole('button', { name: 'Add to Cart' }).click();

        // Verify the item is added to the cart
        const javaScriptBookItem = page.getByRole('listitem').filter({ hasText: 'Learn modern JavaScript' });
        await expect(javaScriptBookItem.getByTestId('cart-item')).toBeVisible();
    });

    test('Proceed to checkout with the correct total in the cart', async ({ page }) => {
        // Navigate to the cart page
        await page.goto(load + '/cart');

        // Navigate to the checkout page using button
        await page.getByRole('button', { name: 'Proceed to Checkout' }).click();

        // Check is the field errors are visible
        await page.getByRole('button', { name: 'Continue to Payment' }).click();

        await expect(page.getByText('Full name is required')).toBeVisible();
        await expect(page.getByText('Address is required')).toBeVisible();
        await expect(page.getByText('City is required')).toBeVisible();
        await expect(page.getByText('State is required')).toBeVisible();
        await expect(page.getByText('Postal code is required')).toBeVisible();
        await expect(page.getByText('Phone number is required')).toBeVisible();
        await expect(page.getByText('Email is required')).toBeVisible();

        // Fill in the checkout form
        await page.getByRole('textbox', { name: 'Full Name' }).click();
        await page.getByRole('textbox', { name: 'Full Name' }).fill('user');
        await page.getByRole('textbox', { name: 'Address Line 1' }).click();
        await page.getByRole('textbox', { name: 'Address Line 1' }).fill('123 example road');
        await page.getByRole('textbox', { name: 'Suburb' }).click();
        await page.getByRole('textbox', { name: 'Suburb' }).fill('example');
        await page.getByLabel('State').selectOption('NSW');
        await page.getByRole('textbox', { name: 'Postcode' }).click();
        await page.getByRole('textbox', { name: 'Postcode' }).fill('2000');
        await page.getByRole('textbox', { name: 'Phone Number' }).click();
        await page.getByRole('textbox', { name: 'Phone Number' }).fill('1234567890');
        await page.getByRole('textbox', { name: 'Email' }).click();
        await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
        await page.getByRole('button', { name: 'Continue to Payment' }).click();

        await expect(page.getByRole('heading', { name: 'Payment Information' })).toBeVisible();
        await page.getByRole('button', { name: 'Continue to Review' }).click();

        
        // Check is the field errors are visible
        await expect(page.getByText('Card number is required')).toBeVisible();
        await expect(page.getByText('Name on card is required')).toBeVisible();
        await expect(page.getByText('Expiry date is required')).toBeVisible();
        await expect(page.getByText('Security code is required')).toBeVisible();

        // Fill in the payment form
        await page.getByRole('textbox', { name: 'Card Number' }).click();
        await page.getByRole('textbox', { name: 'Card Number' }).fill('1234 5678 9000 0000');
        await page.getByRole('textbox', { name: 'Name on Card' }).click();
        await page.getByRole('textbox', { name: 'Name on Card' }).fill('user');
        await page.getByRole('textbox', { name: 'Expiry Date (MM/YY)' }).click();
        await page.getByRole('textbox', { name: 'Expiry Date (MM/YY)' }).fill('07/27');
        await page.getByRole('textbox', { name: 'Security Code (CVV)' }).click();
        await page.getByRole('textbox', { name: 'Security Code (CVV)' }).fill('123');
        await page.getByRole('button', { name: 'Continue to Review' }).click();

        // Verify the review order page
        await expect(page.getByRole('heading', { name: 'Review Your Order' })).toBeVisible();
        await expect(page.locator('body')).toContainText('$99.97 AUD');
        await page.getByRole('button', { name: 'Place Order' }).click();
    });
});