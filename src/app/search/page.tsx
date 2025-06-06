import { AppLayout } from "../components/Layout/AppLayout";
import { Main } from "../components/Main";
import { prisma } from "@/lib/prisma";
import { getSortConfig } from "@/lib/sort";

export default async function SearchPage({
    searchParams
}: {
    searchParams: { q?: string; sort?: string }
}) {
    const { q: query = "", sort } = await searchParams;
    const orderBy = getSortConfig(sort || 'name-asc');

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

    return (
        <AppLayout>
            <Main product={products} />
        </AppLayout>
    );
}