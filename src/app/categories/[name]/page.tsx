import { AppLayout } from "../../components/Layout/AppLayout";
import { Main } from "../../components/Main";
import ProductBanner from "../../components/Layout/Banner";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getSortConfig } from "@/lib/sort";

export default async function Page({
    params,
    searchParams
}: {
    params: Promise<{ name: string }> 
    searchParams: Promise<{ sort?: string }> 
}) {
    // Await params and searchParams (Next.js 15 requirement)
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    
    const categoryName = decodeURIComponent(resolvedParams.name);
    const orderBy = await getSortConfig(resolvedSearchParams.sort || 'name-asc');

    const products = await prisma.product.findMany({
        where: {
            category: categoryName
        },
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

    if (products.length === 0) {
        notFound();
    }

    return (
        <AppLayout>
            <ProductBanner products={featuredProducts} />
            <Main product={products} />
        </AppLayout>
    );
}