import { Main } from "./components/Main";
import { AppLayout } from "./components/Layout/AppLayout";
import { prisma } from "@/lib/prisma";
import { getSortConfig } from "@/lib/sort";

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

  return (
    <AppLayout>
      <Main product={products}/>
    </AppLayout>
  );
}