import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Add item to cart
export async function POST(request: NextRequest) {
  try {
    // Get user ID from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const { productId, quantity = 1 } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    
    // Get user's cart or create one
    let cart = await prisma.cart.findUnique({
      where: {
        userId: userId,
      },
    });
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: userId,
        },
      });
    }
    
    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Check if there's enough stock
    if (quantity > product.stock) {
      return NextResponse.json({ 
        error: `Only ${product.stock} items available in stock`,
        availableStock: product.stock
      }, { status: 400 });
    }
    
    // Check if product is already in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });
    
    if (existingCartItem) {
      // Calculate the new total quantity
      const newTotalQuantity = existingCartItem.quantity + quantity;
      
      // Check if new total exceeds stock
      if (newTotalQuantity > product.stock) {
        return NextResponse.json({ 
          error: `Cannot add ${quantity} more units. You already have ${existingCartItem.quantity} in your cart and only ${product.stock} are available.`,
          availableStock: product.stock,
          currentInCart: existingCartItem.quantity
        }, { status: 400 });
      }
      
      // Update quantity if product already in cart
      const updatedCartItem = await prisma.cartItem.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: newTotalQuantity,
        },
      });
      
      return NextResponse.json(updatedCartItem);
    }
    
    // Add new item to cart
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
    
    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 });
  }
}