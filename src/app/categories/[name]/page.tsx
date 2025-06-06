import { Main } from "../../components/Main";
import { AppLayout } from "../../components/Layout/AppLayout";
import { prisma } from "@/lib/prisma";
import { getSortConfig } from "@/lib/sort";
import { notFound } from "next/navigation";

export default async function Page({
    params,
    searchParams: { sort }
}: {
    params: { name: string }
    searchParams: { sort?: string }
}) {
    const categoryName = await (params.name);
    const orderBy = await (getSortConfig(sort || 'name-asc'));

    const products = await prisma.product.findMany({
        where: {
            category: categoryName
        },
        orderBy
    });

    if (products.length === 0) {
        notFound();
    }

    return (
        <AppLayout>
            <Main product={products} />
        </AppLayout>
    );
}