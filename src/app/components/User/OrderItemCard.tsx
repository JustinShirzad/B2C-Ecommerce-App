'use client';

import { OrderItem, Product } from "@prisma/client";
import Link from 'next/link';
import { useState } from 'react';

// Define the extended type with proper Prisma types
interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

interface OrderItemCardProps {
  orderItem: OrderItemWithProduct;
}

export function OrderItemCard({ orderItem }: OrderItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-4">
      <div className="flex flex-col space-y-2">
        {/* Main Info: Product Name, Quantity, Price */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {orderItem.product.name}
          </h3>
          
          <div className="text-right flex items-center gap-6">
            <p className="text-sm text-gray-600">
              Qty: {orderItem.quantity}
            </p>
            <p className="text-sm font-medium text-gray-900">
              {orderItem.price}
            </p>
          </div>
        </div>

        {/* Toggle Details Button */}
        <div className="pt-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
          >
            {isExpanded ? 'Hide details' : 'View details'}
            <svg
              className={`ml-1 h-3 w-3 transform transition-transform ${!isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Expanded Details - Only Date and Product ID */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <span className="font-medium">Date:</span> {new Date(orderItem.createdAt).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Product ID:</span>{' '}
                <Link
                  href={`/products/${orderItem.productId}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {orderItem.productId}
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderItemCard;