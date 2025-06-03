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
    
    // Update the quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: {
        id: resolvedParams.id,
      },
      data: {
        quantity,
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