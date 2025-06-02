'use client';

import { Product } from "@prisma/client";
import { ProductListItem } from "./ProductListItem";

export function ProductList({ products = [] }: { products?: Product[] }) {
    if (!products || products.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-gray-500">No products found.</p>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductListItem key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

export default ProductList;