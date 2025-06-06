import { test, expect } from '@playwright/test';
import { seedData } from '../fixtures//seedHelper';

test.describe('Account Management E2E Tests', () => {

    const load = 'http://localhost:3000/';

    test.beforeAll(async ({ browser }) => {
        // Clear cookies once before all tests in this file
        const context = await browser.newContext();
        await seedData();
        await context.clearCookies({ name: 'user-id' });
        await context.close();
    });

    test.beforeEach(async ({ page }) => {
        // Navigate to the home page before each test
        await page.goto(load);
    });

    test('Register a new user', async ({ page }) => {
        // Navigate from the home page
        await expect(page.getByRole('banner')).toContainText('Account');
        await page.getByRole('link', { name: 'Account' }).click();

        // Verify the account page
        await expect(page.getByRole('paragraph')).toContainText('Don\'t have an account? Create an account here');
        await page.getByRole('link', { name: 'Create an account here' }).click();

        // Verify the registration form
        await expect(page.getByRole('heading')).toContainText('Create an Account');
        await page.getByRole('textbox', { name: 'Full Name' }).click();
        await page.getByRole('textbox', { name: 'Full Name' }).fill('EndTwoEnd');
        await page.getByRole('textbox', { name: 'Email Address' }).click();
        await page.getByRole('textbox', { name: 'Email Address' }).fill('hi@gmail.com');
        await page.getByRole('textbox', { name: 'Password', exact: true }).click();
        await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
        await page.getByRole('textbox', { name: 'Confirm Password' }).click();
        await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');

        // Submit the registration form
        await expect(page.getByRole('heading')).toContainText('Create an Account');
        await page.getByRole('button', { name: 'Create Account' }).click();

        // Verify successful registration
        await expect(page.getByRole('banner')).toContainText('Endtwoend');
    });

    test('Login with existing user', async ({ page }) => {
        // Navigate from the home page where the user is no registered
        await page.getByRole('link', { name: 'Account' }).click();

        // Enter login details
        await page.getByRole('textbox', { name: 'Email Address' }).click();
        await page.getByRole('textbox', { name: 'Email Address' }).fill('user@example.com');
        await page.getByRole('textbox', { name: 'Password' }).click();
        await page.getByRole('textbox', { name: 'Password' }).fill('password123');

        // Sign in and redirect to the home page
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page.getByRole('link', { name: 'Test User' })).toBeVisible();
        await expect(page.getByRole('banner')).toContainText('Test User');
    });

    test('Logout user', async ({ page }) => {
        // Ensure the user is logged in before testing logout
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

        // Navigate to the account page
        await page.goto(load + '/account');
        // Click the logout button
        await page.getByRole('button', { name: 'Logout' }).click();

        // Verify successful logout
        await expect(page.getByRole('banner')).toContainText('Account');
    });
});
