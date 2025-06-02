import { AppLayout } from "../components/Layout/AppLayout";
import { Main } from "../components/Main";
import { prisma } from "@/lib/prisma";

export default async function Page({
    searchParams
}: {
    searchParams: { q?: string }
}) {
    const resolvedParams = await searchParams;
    const query = resolvedParams.q || "";
    
    const products = await prisma.product.findMany({
        where: {
            OR: [
                {
                    name: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                {
                    description: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                {
                    category: {
                        contains: query,
                        mode: 'insensitive'
                    }
                }
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <AppLayout>
            <Main product={products}/>
        </AppLayout>
    );
}