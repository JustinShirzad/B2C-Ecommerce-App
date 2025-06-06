import { Main } from "./components/Main";
import { AppLayout } from "./components/Layout/AppLayout";
import { prisma } from "@/lib/prisma";
import { getSortConfig } from "@/lib/sort";
import ProductBanner from "./components/Layout/Banner";

export default async function Page({
  searchParams
}: {
  searchParams: { sort?: string }
}) {
  const { sort } = await (searchParams);
  const orderBy = await (getSortConfig(sort || 'name-asc'));

  const products = await prisma.product.findMany({
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
      <Main product={products}/>
    </AppLayout>
  );
}