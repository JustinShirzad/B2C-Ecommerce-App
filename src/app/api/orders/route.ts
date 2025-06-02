import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const userId = (await cookies()).get('user-id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: userId
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching orders' },
      { status: 500 }
    );
  }
}