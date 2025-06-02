'use client';

import { Order, OrderItem, Product } from "@prisma/client";
import { OrderListItem } from "./OrderListItem";

// Define extended types for proper data flow
interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

interface OrderWithItems extends Order {
  items: OrderItemWithProduct[];
}

// Define props interface for the component
interface OrderListProps {
  orders: OrderWithItems[];
}

export function OrderList({ orders = [] }: OrderListProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <OrderListItem key={order.id} order={order} />
      ))}
    </div>
  );
}

export default OrderList;