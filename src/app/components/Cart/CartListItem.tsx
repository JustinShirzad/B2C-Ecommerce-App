'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CartItemProps {
  item: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
      description: string;
      stock: number; // Added stock to interface
    };
  };
}

export function CartListItem({ item }: CartItemProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [stockWarning, setStockWarning] = useState<string | null>(null);
  
  // Ensure quantity doesn't exceed stock on initial load
  useEffect(() => {
    if (item.quantity > item.product.stock) {
      handleQuantityChange(item.product.stock);
      setStockWarning(`Quantity adjusted to match available stock (${item.product.stock})`);
    }
  }, [item.product.stock]);
  
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    // Enforce stock limit
    if (newQuantity > item.product.stock) {
      setStockWarning(`Only ${item.product.stock} items available in stock`);
      newQuantity = item.product.stock;
    } else {
      setStockWarning(null);
    }
    
    if (newQuantity === quantity) return;
    
    setIsUpdating(true);
    setQuantity(newQuantity);
    
    try {
      const response = await fetch(`/api/cart/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.availableStock) {
          setStockWarning(`Only ${errorData.availableStock} items available in stock`);
          setQuantity(errorData.availableStock);
          return;
        }
        throw new Error(errorData.error || 'Failed to update item quantity');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error updating cart item:', error);
      setQuantity(item.quantity); // Reset to original quantity on error
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleRemoveItem = async () => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    
    try {
      const response = await fetch(`/api/cart/items/${item.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error removing cart item:', error);
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex items-center p-6 gap-6 w-full">
      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
        {item.product.imageUrl ? (
          <img
            src={item.product.imageUrl || '/placeholder-product.png'}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>
      
      <div className="flex-grow min-w-0 px-4">
        <Link href={`/products/${item.product.id}`} className="text-xl font-medium text-blue-600 hover:underline">
          {item.product.name}
        </Link>
        <p className="text-gray-600 text-base mt-2">{item.product.description}</p>
        
        {/* Stock information display */}
        <div className="mt-1 mb-2">
          {item.product.stock < 5 ? (
            <p className="text-sm text-orange-600">
              Only {item.product.stock} left in stock
            </p>
          ) : (
            <p className="text-sm text-green-600">
              In stock ({item.product.stock} available)
            </p>
          )}
          
          {stockWarning && (
            <p className="text-sm text-red-600 mt-1">
              {stockWarning}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={item.product.stock}
              value={quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              className="w-16 h-10 mx-2 text-center border border-gray-300 rounded-md"
              disabled={isUpdating}
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating || quantity >= item.product.stock}
              className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          
          <button
            onClick={handleRemoveItem}
            disabled={isRemoving}
            className="text-red-600 hover:text-red-800 text-base px-4 py-2 border border-red-200 rounded-md hover:bg-red-50"
            aria-label="Remove item"
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
      
      <div className="text-right flex-shrink-0 w-32 font-medium">
        <p className="text-xl">${(item.product.price * quantity).toFixed(2)}</p>
        <p className="text-sm text-gray-600 mt-1">${item.product.price.toFixed(2)} each</p>
      </div>
    </div>
  );
}