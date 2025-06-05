import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Get user ID from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Parse the request body
    const { cartId, shippingInfo, paymentMethod } = await request.json();
    
    if (!cartId) {
      return NextResponse.json({ error: "Cart ID is required" }, { status: 400 });
    }
    
    // Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: true } } },
    });
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart not found or empty" }, { status: 404 });
    }
    
    // Check if user owns this cart
    if (cart.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized access to cart" }, { status: 403 });
    }
    
    // Check stock availability
    const stockIssues = [];
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        stockIssues.push({
          productId: item.product.id,
          name: item.product.name,
          requested: item.quantity,
          available: item.product.stock
        });
      }
    }
    
    if (stockIssues.length > 0) {
      return NextResponse.json({ 
        error: "Stock issues detected", 
        stockIssues 
      }, { status: 400 });
    }
    
    // Calculate order total
    const orderTotal = cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    
    // Create the order in a transaction to ensure data consistency
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order record
      const newOrder = await tx.order.create({
        data: {
          userId,
          total: orderTotal,
          items: {
            create: cart.items.map(item => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        }
      });

      // 2. Update stock for each product
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.product.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }
      
      // 3. Clear the cart
      await tx.cartItem.deleteMany({
        where: { cartId }
      });
      
      return newOrder;
    });
    
    // Generate a readable order number from the UUID
    const orderNumber = `ORD-${order.id.slice(0, 8).toUpperCase()}`;
    
    // Return success response
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber
    });
    
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ 
      error: "Failed to process order. Please try again." 
    }, { status: 500 });
  }
}