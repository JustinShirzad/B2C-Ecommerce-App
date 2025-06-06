# B2C Ecommerce Application

A full-stack ecommerce application built with Next.js, featuring both customer-facing storefront and admin management panel.

## 🚀 Features

### Customer Features
- **Product Browsing**: Browse products by category with search functionality
- **Shopping Cart**: Add, update, and remove items from cart
- **User Authentication**: Secure registration and login system
- **Order Management**: Place orders and view order history
- **Responsive Design**: Mobile-friendly interface

### Admin Features
- **Admin Dashboard**: Statistics overview with revenue, orders, and product metrics
- **Product Management**: Full CRUD operations for products
- **Order Management**: View and manage customer orders
- **User Management**: View registered users
- **Separate Admin Panel**: Runs on dedicated port (3001)

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Authentication**: Cookie-based sessions with bcryptjs password hashing
- **Testing**: Playwright E2E tests
- **Documentation**: Swagger/OpenAPI annotations

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone and Install
```bash
git clone <repository-url>
cd B2C-Ecommerce-App
npm install
```

### 2. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npx prisma db seed
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

### 4. Start Development Servers

**Customer-facing application** (Port 3000):
```bash
npm run dev
```

Open your browser:
- **Customer Site**: [http://localhost:3000](http://localhost:3000)

## 👥 Default Users

The seeded database includes these test accounts:

### Customer Account
- **Email**: user@example.com
- **Password**: password123

### Admin Account  
- **Email**: admin@example.com
- **Password**: adminpassword

## 🗄 Database Schema

### Core Entities
- **Users**: Customer and admin user accounts
- **Products**: Product catalog with categories, pricing, and inventory
- **Cart**: Shopping cart with items
- **Orders**: Customer orders with items and shipping information

### Relationships
- Users have Carts (1:1)
- Carts have CartItems (1:N)
- Users have Orders (1:N) 
- Orders have OrderItems (1:N)
- Products can be in CartItems and OrderItems (1:N)

## 📚 API Documentation

### Authentication
The API uses cookie-based authentication:
- `user-id`: Simple user identifier
- `session`: JSON session data for admin authentication

---

## 🔐 Authentication Endpoints

### Check Authentication Status
```http
GET /api/auth
```
Validates user session and returns authentication status.

**Response (200)**:
```json
{
  "authenticated": true,
  "user": {
    "id": "string",
    "name": "string", 
    "email": "string",
    "isAdmin": boolean
  }
}
```

### User Login
```http
POST /api/auth/login
```
Authenticates user with email and password.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**:
```json
{
  "message": "Login successful",
  "user": { "id": "...", "name": "...", "email": "...", "isAdmin": false }
}
```

### User Registration
```http
POST /api/auth/register
```
Creates new user account.

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123"
}
```

### User Logout
```http
POST /api/auth/logout
```
Clears user session cookies.

---

## 🛒 Cart Management Endpoints

### Add Item to Cart
```http
POST /api/cart/items
```
**Authentication**: Required

**Request**:
```json
{
  "productId": "wireless-headphones",
  "quantity": 2
}
```

**Response**:
```json
{
  "cartItem": {
    "id": "string",
    "quantity": 2,
    "product": { "id": "...", "name": "...", "price": 99.99 }
  }
}
```

### Get Cart Items
```http
GET /api/cart/items
```
**Authentication**: Required

Returns all items in user's cart.

### Update Cart Item
```http
PATCH /api/cart/items/{id}
```
**Authentication**: Required

Updates quantity of specific cart item.

### Remove Cart Item
```http
DELETE /api/cart/items/{id}
```
**Authentication**: Required

Removes item from cart.

---

## 📦 Order Management Endpoints

### Process Checkout
```http
POST /api/checkout
```
**Authentication**: Required

Creates order from cart items.

**Request**:
```json
{
  "shippingInfo": {
    "address": "123 Main Street",
    "city": "New York",
    "zipCode": "10001"
  },
  "paymentMethod": "credit_card"
}
```

**Response**:
```json
{
  "success": true,
  "orderId": "string",
  "orderNumber": "ORD-ABC12345",
  "totalAmount": 299.99
}
```

---

## 🎯 Testing

### E2E Testing with Playwright
```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npm run test:e2e

_# Note: Tests typically fail unless they are run 1 by 1. _
```

### Test Coverage
- Authentication flows (login, register, logout)
- Cart operations (add, update, remove items)
- Checkout process and order creation
- Admin product management
- User account management

## 📁 Project Structure
```
B2C-Ecommerce-App/
├── src/
│   ├── app/
│   │   ├── admin/                 # Admin panel pages
│   │   │   ├── layout.tsx         # Admin layout
│   │   │   ├── page.tsx           # Admin dashboard
│   │   │   ├── products/          # Product management
│   │   │   └── orders/            # Order management
│   │   ├── api/                   # API routes
│   │   │   ├── auth/              # Authentication endpoints
│   │   │   ├── cart/              # Cart management
│   │   │   ├── checkout/          # Order processing
│   │   │   └── admin/             # Admin-only endpoints
│   │   ├── account/               # User account pages
│   │   ├── cart/                  # Shopping cart page
│   │   ├── components/            # Reusable components
│   │   │   ├── Admin/             # Admin-specific components
│   │   │   └── User/              # Customer components
│   │   └── globals.css            # Global styles
│   └── lib/                       # Utilities and configurations
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── seed.ts                    # Database seeding
│   └── migrations/                # Database migrations
├── tests/
│   └── E2E/                       # Playwright E2E tests
└── public/                        # Static assets
```

## 🚀 Deployment

### Database Migration
```bash
# Generate production client
npx prisma generate

# Deploy migrations
npx prisma migrate deploy

# Seed production database (optional)
npx prisma db seed
```

### Environment Variables
Set these environment variables for production:
```env
DATABASE_URL="postgresql://user:password@host:port/database"
NODE_ENV="production"
```

### Build and Start
```bash
# Build the application
npm run build

# Start production server (customer site)
npm run start

# Start production admin panel
npm run start:admin
```

## 🔧 Available Scripts

```bash
npm run dev         # Start customer development server (port 3000)
npm run dev:admin   # Start admin development server (port 3001)
npm run build       # Build for production
npm run start       # Start production customer server
npm run start:admin # Start production admin server
npm run test:e2e    # Run Playwright E2E tests
npm run lint        # Run ESLint
```
---
**Happy coding! 🚀**
