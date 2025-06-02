import { Main } from "../../components/Main";
import { AppLayout } from "../../components/Layout/AppLayout";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function Page({
    params
}: {
    params: { name: string }
}) {
    const categoryName = params.name;

    const products = await prisma.product.findMany({
        where: {
            category: categoryName
        },
        orderBy: {
            createdAt: 'desc'
        }
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