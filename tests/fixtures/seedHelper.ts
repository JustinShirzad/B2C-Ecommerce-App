import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

export async function seedData() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        id: 'wireless-headphones',
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation.',
        price: 99.99,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        category: 'Electronics',
        stock: 50,
      },
    }),
    prisma.product.create({
      data: {
        id: 'smart-watch',
        name: 'Smart Watch',
        description: 'Track your fitness and stay connected.',
        price: 199.99,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        category: 'Electronics',
        stock: 30,
      },
    }),
    prisma.product.create({
      data: {
        id: 'cotton-t-shirt',
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt.',
        price: 24.99,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        category: 'Clothing',
        stock: 100,
      },
    }),
    prisma.product.create({
      data: {
        id: 'js-book',
        name: 'JavaScript Book',
        description: 'Learn modern JavaScript programming.',
        price: 39.99,
        imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765',
        category: 'Books',
        stock: 25,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Yoga Mat',
        description: 'Non-slip, eco-friendly yoga mat with alignment markings, perfect for all types of yoga.',
        price: 29.99,
        imageUrl: 'https://images.unsplash.com/photo-1599447332412-6bc6830c815a',
        category: 'Fitness',
        stock: 75,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Gaming Keyboard',
        description: 'Mechanical gaming keyboard with RGB backlighting and programmable keys.',
        price: 129.99,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
        category: 'Electronics',
        stock: 42,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Plant Pot Set',
        description: 'Set of 3 ceramic plant pots in different sizes with bamboo trays.',
        price: 34.99,
        imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411',
        category: 'Home',
        stock: 20,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Human Heart',
        description: 'It stills beats sometimes.',
        price: 999.99,
        imageUrl: 'https://images.unsplash.com/photo-1567974775951-4a1759f26045?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        category: 'Anatomy',
        stock: 0,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Smoker Lungs',
        description: 'A cheap alternative to healthy lungs, useful for experiments.',
        price: 10,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1722947097108-9af829cf1ded?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8c21va2VyJTIwbHVuZ3xlbnwwfHwwfHx8MA%3D%3D',
        category: 'Anatomy',
        stock: 7,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Femur Bone',
        description: 'A strong and sturdy femur bone, the perfect weapon.',
        price: 157.4,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1722867780455-13cfcefd1138?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZmVtdXJ8ZW58MHx8MHx8fDA%3D',
        category: 'Anatomy',
        stock: 1,
      },
    }),
  ]);

  const hashedUserPassword = await bcrypt.hash('password123', 12);
  const hashedAdminPassword = await bcrypt.hash('adminpassword', 12);

  const user = await prisma.user.create({
    data: {
      id: 'test-user-id',
      email: 'user@example.com',
      name: 'Test User',
      password: hashedUserPassword,
      isAdmin: false,
      cart: {
        create: {
          // Create cart with items directly
          items: {
            create: [
              {
                productId: products[6].id, // Plant Pot Set
                quantity: 2,
              },
              {
                productId: products[4].id, // Yoga Mat
                quantity: 1,
              }
            ]
          }
        }
      }
    },
    // Include cart and cart items in the return value
    include: {
      cart: {
        include: {
          items: true
        }
      }
    }
  });

  const admin = await prisma.user.create({
    data: {
      id: 'admin-user-id',
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedAdminPassword,
      isAdmin: true,
    },
  });

  const singleItemOrder = await prisma.order.create({
    data: {
      userId: user.id,
      total: 99.99,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            price: products[0].price,
          }
        ]
      }
    }
  });

  const multiItemOrder = await prisma.order.create({
    data: {
      userId: user.id,
      total: (products[1].price * 1) +
             (products[2].price * 2) +
             (products[3].price * 1) +
             (products[4].price * 1) +
             (products[5].price * 1),
      items: {
        create: [
          {
            productId: products[1].id,
            quantity: 1,
            price: products[1].price,
          },
          {
            productId: products[2].id,
            quantity: 2,
            price: products[2].price,
          },
          {
            productId: products[3].id,
            quantity: 1,
            price: products[3].price,
          },
          {
            productId: products[4].id,
            quantity: 1,
            price: products[4].price,
          },
          {
            productId: products[5].id,
            quantity: 1,
            price: products[5].price,
          },
        ]
      }
    }
  });

  console.log(`Database has been seeded. 🌱`);
}