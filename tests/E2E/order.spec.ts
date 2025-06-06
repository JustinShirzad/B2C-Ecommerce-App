import { test, expect } from '@playwright/test';
import { seedData } from '../fixtures//seedHelper';
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

test.describe('Order E2E Tests', () => {

    const load = 'http://localhost:3000/';
    const userId = 'test-user-id';

    test.beforeAll(async ({ browser }) => {
        // Clear cookies once before all tests in this file
        const context = await browser.newContext();
        await context.close();
    });

    test.beforeEach(async ({ page, browser }) => {
        // Navigate to the home page before each test
        await seedData();
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

    test('Check if orders load on Account page', async ({ page }) => {
        // Navigate to the account page
        await page.getByRole('link', { name: 'Account' }).first().click();

        // Check if orders are displayed
        const orderListItem = page.locator('[data-testid="order-item"]');
        await expect(orderListItem).toHaveCount(2);

        // Check if the first order is visible
        const firstOrder = orderListItem.first();
        await expect(firstOrder).toBeVisible();

        // Check if the first order has the correct text
        await expect(firstOrder.getByText('Order')).toBeVisible();
        await expect(firstOrder.getByText('$449.94')).toBeVisible();

        // Check if the first order has a button to view items
        await firstOrder.getByRole('button', { name: 'View items' }).first().click();

        // Check if the order items are displayed
        const orderItemCards = page.locator('[data-testid="order-item-card"]');
        await expect(orderItemCards).toHaveCount(5);
    });

    test('Add an order', async ({ page }) => {

        const userCart = await prismaClient.cart.findUnique({
            where: {
                userId: userId,
            },
        });

        // Call checkout API to create an order
        const checkoutResponse = await page.request.post(`${load}api/checkout`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                cartId: userCart?.id,
                shippingInfo: {
                    address: '456 New Test Street',
                    city: 'New Test City',
                    zipCode: '54321'
                },
                paymentMethod: 'credit_card'
            }
        });

        // Verify checkout was successful
        expect(checkoutResponse.status()).toBe(200);
        const checkoutData = await checkoutResponse.json();
        expect(checkoutData.success).toBe(true);
        expect(checkoutData).toHaveProperty('orderId');
        expect(checkoutData).toHaveProperty('orderNumber');

        console.log('Created order:', checkoutData.orderNumber);
        console.log('Order ID:', checkoutData.orderId);

        // Expected total: (Wireless Headphones: $99.99 * 2) + (Smart Watch: $199.99 * 1) = $399.97
        const expectedTotal = (99.99 * 2) + (199.99 * 1);
        console.log('Expected order total:', `$${expectedTotal.toFixed(2)}`);

        // Navigate to account page to verify the new order exists
        await page.getByRole('link', { name: 'Account' }).first().click();

        // Wait for orders to load
        await page.waitForLoadState('networkidle');

        // Check if orders are displayed - should now have 3 orders (2 seed + 1 new)
        const orderListItem = page.locator('[data-testid="order-item"]');
        await expect(orderListItem).toHaveCount(3);

        // Check if the newest order (first in list) has the correct details
        const firstOrder = orderListItem.first();
        await expect(firstOrder).toBeVisible();
        await expect(firstOrder.getByText('Order')).toBeVisible();
    });
});