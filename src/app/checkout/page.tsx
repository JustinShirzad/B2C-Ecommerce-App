import { redirect } from "next/navigation";
import { Checkout } from "../components/Cart/Checkout";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { TopMenu } from "@/app/components/Layout/TopMenu";

export default async function CheckoutPage() {
  // Get user ID from cookie
  const cookieStore = await cookies();
  const userId = cookieStore.get('user-id')?.value;
  
  // Redirect to login if not authenticated
  if (!userId) {
    redirect('/account');
  }
  
  // Get user's cart with items
  const cart = await prisma.cart.findUnique({
    where: { 
      userId 
    },
    include: { 
      items: { 
        include: { 
          product: true 
        } 
      } 
    },
  });
  
  // Redirect to cart if no cart or empty cart
  if (!cart || cart.items.length === 0) {
    redirect('/cart');
  }
  
  // Calculate cart total and item count
  const cartTotal = cart.items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
  
  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <>
      <TopMenu />
      <Checkout 
        cartId={cart.id} 
        cartTotal={cartTotal} 
        itemCount={itemCount} 
      />
    </>
  );
}