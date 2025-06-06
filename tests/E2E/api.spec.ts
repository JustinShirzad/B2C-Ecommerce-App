import { test, expect } from '@playwright/test';
import { seedData } from '../fixtures/seedHelper';

test.describe('API Routes Tests', () => {
    const baseURL = 'http://localhost:3000';

    test.beforeEach(async ({ browser }) => {
        const context = await browser.newContext();
        await seedData();
        await context.close();
    });

    test.describe('Auth API Routes', () => {

        test('POST /api/auth/register - Register new user', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/auth/register`, {
                data: {
                    name: 'New Test User',
                    email: 'newuser@example.com',
                    password: 'newpassword123'
                }
            });

            expect(response.status()).toBe(201);
            const data = await response.json();
            expect(data.message).toBe('User registered successfully');
            expect(data.user).toHaveProperty('id');
            expect(data.user.name).toBe('New Test User');
            expect(data.user.email).toBe('newuser@example.com');
            expect(data.user).not.toHaveProperty('password');
        });

        test('POST /api/auth/register - Fail with existing email', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/auth/register`, {
                data: {
                    name: 'Another User',
                    email: 'user@example.com', // This email already exists in seed data
                    password: 'anotherpassword123'
                }
            });

            expect(response.status()).toBe(409);
            const data = await response.json();
            expect(data.error).toBe('A user with this email already exists');
        });

        test('POST /api/auth/register - Fail with short password', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/auth/register`, {
                data: {
                    name: 'Test User',
                    email: 'shortpass@example.com',
                    password: '123' // Too short
                }
            });

            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Password must be at least 8 characters');
        });

        test('POST /api/auth/login - Login with valid credentials', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/auth/login`, {
                data: {
                    email: 'user@example.com',
                    password: 'password123'
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.message).toBe('Login successful');
            expect(data.user).toHaveProperty('id');
            expect(data.user.email).toBe('user@example.com');
            expect(data.user).not.toHaveProperty('password');
        });

        test('POST /api/auth/login - Fail with invalid credentials', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/auth/login`, {
                data: {
                    email: 'user@example.com',
                    password: 'wrongpassword'
                }
            });

            expect(response.status()).toBe(401);
            const data = await response.json();
            expect(data.error).toBe('Invalid email or password');
        });

        test('GET /api/auth - Check authentication without login', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/auth`);
            expect(response.status()).toBe(401);
            const data = await response.json();
            expect(data.authenticated).toBe(false);
        });
    });

    test.describe('Cart API Routes', () => {
        let userCookies: string;

        test.beforeEach(async ({ request }) => {
            // Login to get user session
            const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
                data: {
                    email: 'user@example.com',
                    password: 'password123'
                }
            });

            const setCookieHeader = loginResponse.headers()['set-cookie'];
            if (setCookieHeader) {
                userCookies = Array.isArray(setCookieHeader) ? setCookieHeader.join('; ') : setCookieHeader;
            }
        });

        test('POST /api/cart/items - Add item to cart', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/cart/items`, {
                headers: {
                    'Cookie': userCookies
                },
                data: {
                    productId: 'wireless-headphones',
                    quantity: 2
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.cartItem).toHaveProperty('id');
            expect(data.cartItem.quantity).toBe(2);
            expect(data.cartItem.product.name).toBe('Wireless Headphones');
        });

        test('POST /api/cart/items - Add item with invalid product ID', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/cart/items`, {
                headers: {
                    'Cookie': userCookies
                },
                data: {
                    productId: 'invalid-product-id',
                    quantity: 1
                }
            });

            expect(response.status()).toBe(404);
            const data = await response.json();
            expect(data.error).toBe('Product not found');
        });

        test('POST /api/cart/items - Add item exceeding stock', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/cart/items`, {
                headers: {
                    'Cookie': userCookies
                },
                data: {
                    productId: 'js-book', // Has stock of 25
                    quantity: 30 // Exceeds available stock
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.adjusted).toBe(true);
            expect(data.cartItem.quantity).toBe(25); // Should be adjusted to max stock
            expect(data.message).toContain('adjusted');
        });
    });

    test.describe('Cart Items Management', () => {
        let userCookies: string;
        let cartItemId: string;

        test.beforeEach(async ({ request }) => {
            // Login and add an item to get cart item ID
            const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
                data: {
                    email: 'user@example.com',
                    password: 'password123'
                }
            });

            const setCookieHeader = loginResponse.headers()['set-cookie'];
            if (setCookieHeader) {
                userCookies = Array.isArray(setCookieHeader) ? setCookieHeader.join('; ') : setCookieHeader;
            }

            // Add item to cart to get cart item ID
            const addItemResponse = await request.post(`${baseURL}/api/cart/items`, {
                headers: {
                    'Cookie': userCookies
                },
                data: {
                    productId: 'smart-watch',
                    quantity: 1
                }
            });

            const addItemData = await addItemResponse.json();
            cartItemId = addItemData.cartItem.id;
        });

        test('PATCH /api/cart/items/[id] - Update cart item quantity', async ({ request }) => {
            const response = await request.patch(`${baseURL}/api/cart/items/${cartItemId}`, {
                headers: {
                    'Cookie': userCookies
                },
                data: {
                    quantity: 3
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.quantity).toBe(3);
            expect(data.product.name).toBe('Smart Watch');
        });

        test('PATCH /api/cart/items/[id] - Update with invalid quantity', async ({ request }) => {
            const response = await request.patch(`${baseURL}/api/cart/items/${cartItemId}`, {
                headers: {
                    'Cookie': userCookies
                },
                data: {
                    quantity: 0 // Invalid quantity
                }
            });

            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Invalid quantity');
        });

        test('PATCH /api/cart/items/[id] - Update exceeding stock', async ({ request }) => {
            const response = await request.patch(`${baseURL}/api/cart/items/${cartItemId}`, {
                headers: {
                    'Cookie': userCookies
                },
                data: {
                    quantity: 50 // Smart Watch has stock of 30
                }
            });

            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data.error).toContain('Only 30 items available in stock');
            expect(data.availableStock).toBe(30);
        });

        test('DELETE /api/cart/items/[id] - Remove cart item', async ({ request }) => {
            const response = await request.delete(`${baseURL}/api/cart/items/${cartItemId}`, {
                headers: {
                    'Cookie': userCookies
                }
            });

            expect(response.status()).toBe(200);
        });

        test('DELETE /api/cart/items/[id] - Remove non-existent item', async ({ request }) => {
            const response = await request.delete(`${baseURL}/api/cart/items/non-existent-id`, {
                headers: {
                    'Cookie': userCookies
                }
            });

            expect(response.status()).toBe(404);
            const data = await response.json();
            expect(data.error).toBe('Cart item not found');
        });
    });

    test.describe('Checkout API Routes', () => {
        let userCookies: string;
        let cartId: string;

        test.beforeEach(async ({ request }) => {
            // Login and prepare cart for checkout
            const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
                data: {
                    email: 'user@example.com',
                    password: 'password123'
                }
            });

            const setCookieHeader = loginResponse.headers()['set-cookie'];
            if (setCookieHeader) {
                userCookies = Array.isArray(setCookieHeader) ? setCookieHeader.join('; ') : setCookieHeader;
            }

            // Add items to cart for checkout
            await request.post(`${baseURL}/api/cart/items`, {
                headers: {
                    'Cookie': userCookies
                },
                data: {
                    productId: 'cotton-t-shirt',
                    quantity: 2
                }
            });

            // Assuming cart ID is the user ID for simplicity (based on your schema)
            cartId = 'test-user-id'; // This should match the cart created for the test user
        });

        test('POST /api/checkout - Successful checkout', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/checkout`, {
                headers: {
                    'Cookie': userCookies
                },
                data: {
                    cartId: cartId,
                    shippingInfo: {
                        address: '123 Test Street',
                        city: 'Test City',
                        zipCode: '12345'
                    },
                    paymentMethod: 'credit_card'
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data).toHaveProperty('orderId');
            expect(data).toHaveProperty('orderNumber');
            expect(data.orderNumber).toMatch(/^ORD-[A-Z0-9]{8}$/);
        });

        test('POST /api/checkout - Checkout without authentication', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/checkout`, {
                data: {
                    cartId: cartId,
                    shippingInfo: {
                        address: '123 Test Street',
                        city: 'Test City',
                        zipCode: '12345'
                    },
                    paymentMethod: 'credit_card'
                }
            });

            expect(response.status()).toBe(401);
            const data = await response.json();
            expect(data.error).toBe('Not authenticated');
        });

        test('POST /api/checkout - Checkout with missing cart ID', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/checkout`, {
                headers: {
                    'Cookie': userCookies
                },
                data: {
                    shippingInfo: {
                        address: '123 Test Street',
                        city: 'Test City',
                        zipCode: '12345'
                    },
                    paymentMethod: 'credit_card'
                }
            });

            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Cart ID is required');
        });

        test('POST /api/checkout - Checkout with non-existent cart', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/checkout`, {
                headers: {
                    'Cookie': userCookies
                },
                data: {
                    cartId: 'non-existent-cart-id',
                    shippingInfo: {
                        address: '123 Test Street',
                        city: 'Test City',
                        zipCode: '12345'
                    },
                    paymentMethod: 'credit_card'
                }
            });

            expect(response.status()).toBe(404);
            const data = await response.json();
            expect(data.error).toBe('Cart not found or empty');
        });
    });

    test.describe('Auth Status Check', () => {

        test('GET /api/auth - Check authentication with valid session', async ({ request }) => {
            // First login to get session
            const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
                data: {
                    email: 'user@example.com',
                    password: 'password123'
                }
            });

            const setCookieHeader = loginResponse.headers()['set-cookie'];
            let userCookies = '';
            if (setCookieHeader) {
                userCookies = Array.isArray(setCookieHeader) ? setCookieHeader.join('; ') : setCookieHeader;
            }

            // Check auth status
            const response = await request.get(`${baseURL}/api/auth`, {
                headers: {
                    'Cookie': userCookies
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.authenticated).toBe(true);
            expect(data.user).toHaveProperty('id');
            expect(data.user.email).toBe('user@example.com');
            expect(data.user.name).toBe('Test User');
        });

        test('GET /api/auth - Check authentication with admin user', async ({ request }) => {
            // Login as admin
            const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
                data: {
                    email: 'admin@example.com',
                    password: 'adminpassword'
                }
            });

            const setCookieHeader = loginResponse.headers()['set-cookie'];
            let adminCookies = '';
            if (setCookieHeader) {
                adminCookies = Array.isArray(setCookieHeader) ? setCookieHeader.join('; ') : setCookieHeader;
            }

            // Check auth status
            const response = await request.get(`${baseURL}/api/auth`, {
                headers: {
                    'Cookie': adminCookies
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.authenticated).toBe(true);
            expect(data.user.isAdmin).toBe(true);
            expect(data.user.email).toBe('admin@example.com');
        });
    });
});