'use client';

import { Order, OrderItem, Product } from "@prisma/client";
import { useState } from 'react';
import { OrderItemCard } from "./OrderItemCard";

// Define extended types for proper data flow
interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

interface OrderWithItems extends Order {
  items: OrderItemWithProduct[];
}

interface OrderListItemProps {
  order: OrderWithItems;
}

export function OrderListItem({ order }: OrderListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const orderDateISO = order.createdAt.toISOString().split('T')[0];
  
  return (
    <div className="border rounded-lg bg-white shadow-md">
      {/* Order Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-700">
              Order #{order.id.slice(-6).toUpperCase()}
            </h3>
            <p className="text-sm text-gray-500">Placed on {orderDateISO}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">${order.total}</p>
            <p className="text-sm text-gray-500">
              {order.items?.length || 0} item(s)
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          {isExpanded ? 'Hide items' : 'View items'}
          <svg
            className={`ml-1 h-4 w-4 transform transition-transform ${!isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Order Items */}
      {isExpanded && order.items && order.items.length > 0 && (
        <div className="divide-y divide-gray-100">
          {order.items.map((orderItem) => (
            <OrderItemCard key={orderItem.id} orderItem={orderItem} />
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderListItem;