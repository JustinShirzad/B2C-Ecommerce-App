'use client';

import { Product } from "@prisma/client";
import { ProductList } from "./Products/ProductList";

export function Main({ product, className,}: {
    product: Product[];
    className?: string;
}) {
    return (
        <main className={className}>
            <ProductList products={product} />
        </main>
    );
}
