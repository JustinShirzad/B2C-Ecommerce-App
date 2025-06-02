'use client';

import { Product } from "@prisma/client";
import Link from "next/link";

interface ProductListItemProps {
  product: Product;
}

export function ProductListItem({ product }: ProductListItemProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/products/${product.id}`} className="block h-48 overflow-hidden">
        <img
          src={product.imageUrl || '/placeholder-product.png'}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2 h-14">
          <Link href={`/products/${product.id}`} className="hover:text-blue-600">
            {product.name}
          </Link>
        </h3>

        <p className="text-sm text-gray-500 mb-2">
          {product.category}
        </p>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
          {product.description.length > 100 ? `${product.description.substring(0, 100)}...` : product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <p className="text-lg font-semibold text-gray-900">
            ${product.price.toFixed(2)}
          </p>

          <div className="text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600">In Stock ({product.stock})</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}