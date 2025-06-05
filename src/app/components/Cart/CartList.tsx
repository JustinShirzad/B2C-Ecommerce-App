'use client';

import { Cart } from "@prisma/client";
import { CartListItem } from "./CartListItem";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CartWithItems extends Cart {
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
      description: string;
      stock: number;
    };
  }>;
}

interface CartListProps {
  cart: CartWithItems;
  cartTotal: number;
}

export function CartList({ cart, cartTotal }: CartListProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  if (cart.items.length === 0) {
    return (
      <div>
        <p className="text-gray-600">Your cart is empty.</p>
        <div className="mt-4">
          <a href="/" className="text-blue-600 hover:underline">Continue shopping</a>
        </div>
      </div>
    );
  }

  // Simply navigate to the checkout page - no API calls
  const handleProceedToCheckout = () => {
    setIsProcessing(true);
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-3/4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {cart.items.map((item) => (
              <li key={item.id}>
                <CartListItem item={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="lg:w-1/4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-medium mb-4">Order Summary</h2>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={isProcessing}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
}