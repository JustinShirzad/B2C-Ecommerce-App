import { AppLayout } from "../components/Layout/AppLayout";
import { Main } from "../components/Main";
import { prisma } from "@/lib/prisma";
import { getSortConfig } from "@/lib/sort";
import ProductBanner from "../components/Layout/Banner";

export default async function SearchPage({
    searchParams
}: {
    searchParams: { q?: string; sort?: string }
}) {
    const { q: query = "", sort } = await (searchParams);
    const orderBy = await (getSortConfig(sort || 'name-asc'));

    const products = await prisma.product.findMany({
        where: query ? {
            OR: [
                { name: { contains: query } },
                { description: { contains: query } },
                { category: { contains: query } }
            ]
        } : {},
        orderBy
    });

    const featuredProducts = await prisma.product.findMany({
    where: {
      stock: {
        gt: 0 // Only show products that are in stock
      }
    },
    orderBy: [
      { category: 'asc' },
      { createdAt: 'desc' }
    ],
    take: 5 // Show 5 featured products in rotation
  });

    return (
        <AppLayout>
            <ProductBanner products={featuredProducts} />
            <Main product={products} />
        </AppLayout>
    );
}