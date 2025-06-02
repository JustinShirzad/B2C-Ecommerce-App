import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const userId = (await cookies()).get('user-id')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { authenticated: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    });
    
    if (!user) {
      (await cookies()).delete('user-id');
      return NextResponse.json(
        { authenticated: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      authenticated: true,
      user
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}