import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.password) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch && password !== user.password) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const { password: _password, ...userWithoutPassword } = user;

        const response = NextResponse.json({
            message: 'Login successful',
            user: userWithoutPassword,
        });

        response.cookies.set({
            name: 'user-id',
            value: user.id,
            httpOnly: true,
            maxAge: 36000,
            path: '/',
            sameSite: 'lax'
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'An error occurred during login' },
            { status: 500 }
        );
    }
}