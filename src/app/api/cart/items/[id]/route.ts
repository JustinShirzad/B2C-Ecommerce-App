import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Update cart item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { quantity } = await request.json();

    if (typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // Await params before using them (Next.js 15 requirement)
    const resolvedParams = await params;

    // Get the cart item with product information
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        id: resolvedParams.id,
      },
      include: {
        cart: true,
        product: true, // Include product to check stock
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    // Check if the cart belongs to the user
    if (cartItem.cart.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if the requested quantity exceeds available stock
    if (quantity > cartItem.product.stock) {
      return NextResponse.json({
        error: `Only ${cartItem.product.stock} items available in stock`,
        availableStock: cartItem.product.stock
      }, { status: 400 });
    }

    // Update the quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: {
        id: resolvedParams.id,
      },
      data: {
        quantity,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(updatedCartItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 });
  }
}

// Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const resolvedParams = await params;

    // Get the cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        id: resolvedParams.id,
      },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    // Check if the cart belongs to the user
    if (cartItem.cart.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: {
        id: resolvedParams.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return NextResponse.json({ error: "Failed to remove cart item" }, { status: 500 });
  }
}