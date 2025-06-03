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
    
    // Check if product exists and get stock information
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Check if product is already in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });
    
    // Handle new item creation or updating existing item
    let adjustedQuantity: number;
    let message: string | null = null;
    
    if (existingCartItem) {
      // Calculate total quantity after adding
      let newTotalQuantity = existingCartItem.quantity + quantity;
      
      // Adjust quantity if it exceeds stock
      if (newTotalQuantity > product.stock) {
        const originalRequested = newTotalQuantity;
        newTotalQuantity = product.stock;
        message = `We've adjusted your cart to the maximum available quantity (${product.stock})`;
      }
      
      // Only update if the quantity is different
      if (newTotalQuantity !== existingCartItem.quantity) {
        // Update quantity if product already in cart
        const updatedCartItem = await prisma.cartItem.update({
          where: {
            id: existingCartItem.id,
          },
          data: {
            quantity: newTotalQuantity,
          },
          include: {
            product: true,
          },
        });
        
        return NextResponse.json({
          cartItem: updatedCartItem,
          adjusted: message !== null,
          message: message,
        });
      } else {
        // No change needed
        return NextResponse.json({
          cartItem: existingCartItem,
          adjusted: false,
          message: "Item already in cart with this quantity",
        });
      }
    } else {
      // For new cart items, adjust quantity if needed
      adjustedQuantity = quantity;
      
      if (adjustedQuantity > product.stock) {
        adjustedQuantity = product.stock;
        message = `We've adjusted your cart to the maximum available quantity (${product.stock})`;
      }
      
      // Add new item to cart with adjusted quantity
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: adjustedQuantity,
        },
        include: {
          product: true,
        },
      });
      
      return NextResponse.json({
        cartItem: cartItem,
        adjusted: message !== null,
        message: message,
      });
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 });
  }
}