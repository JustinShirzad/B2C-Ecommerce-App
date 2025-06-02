import { Main } from "../../components/Main";
import { AppLayout } from "../../components/Layout/AppLayout";

export default async function Page({ params, }: { params: Promise<{ name: string }>;}) 
{
    const response = await fetch(new URL('/api/products', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), {
        cache: "no-store",
    });
    const product = await response.json();
    const { name } = await params;

    const filteredProducts = product.filter((item: { category: string; }) => item.category === name);        

    return (
        <AppLayout>
            <Main product={filteredProducts} />
        </AppLayout>
    );
}